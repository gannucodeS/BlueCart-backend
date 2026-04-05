const mongoose = require('mongoose');

/**
 * Mongoose connection options (helps with timeouts; TLS is default for Atlas).
 * If you see: querySrv ECONNREFUSED _mongodb._tcp...
 * → Your network/DNS is blocking SRV lookups for mongodb+srv://
 * → Fix: In Atlas → Connect → Drivers, use the "Standard connection string"
 *   (mongodb://host1:27017,host2:27017,...) instead of mongodb+srv://
 */
const defaultOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000
};

async function connectDb(mongoUri) {
  if (!mongoUri) throw new Error('Missing MongoDB URI');
  await mongoose.connect(mongoUri, defaultOptions);
  return mongoose.connection;
}

module.exports = { connectDb };
