import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import erpRoutes from './routes/erp.routes.js';
import suppliersRoutes from './routes/suppliers.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Behind nginx/TLS termination — trust the proxy so secure cookies and req.ip work.
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3001',
  'https://lockseed.vercel.app',
  'https://lockseed.codewithseth.co.ke',
];

// Allow any extra origin configured via CLIENT_URL (comma-separated supported).
if (process.env.CLIENT_URL) {
  for (const origin of process.env.CLIENT_URL.split(',')) {
    const trimmed = origin.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server) with no Origin header.
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lockseed-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/suppliers', suppliersRoutes);

app.use(errorHandler);

export default app;
