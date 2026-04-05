require('dotenv').config();

const { connectDb } = require('./config/db');
const { ensureSeed } = require('./seed/seed');
const { createApp } = require('./app');

async function start() {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Missing `MONGODB_URI` in environment (.env).');
    process.exit(1);
  }

  await connectDb(MONGODB_URI);
  await ensureSeed();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`BlueCart running at http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error('Failed to start:', e);
  process.exit(1);
});

