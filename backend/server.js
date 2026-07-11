import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Lockseed website backend running on http://localhost:${PORT}`);
    console.log(`ERP target: ${process.env.ERP_API_BASE_URL || 'http://localhost:5010'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start backend:', err.message);
  process.exit(1);
});
