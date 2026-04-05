/**
 * Quick MongoDB connectivity check (reads MONGODB_URI from backend/.env).
 * Run from backend folder: node scripts/test-connection.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI in backend/.env');
  process.exit(1);
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('Connected OK');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Connection failed:', err.message);
    if (String(err.message).includes('querySrv')) {
      console.error(
        '\nTip: If you see querySrv errors, try Atlas "Standard connection string" (mongodb://...) instead of mongodb+srv:// — see backend/README.md'
      );
    }
    process.exit(1);
  });
