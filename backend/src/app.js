import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import erpRoutes from './routes/erp.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';

app.use(
  cors({
    origin: clientUrl,
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

app.use(errorHandler);

export default app;
