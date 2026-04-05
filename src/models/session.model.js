const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: Number, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  expiry: { type: Date, required: true }
});

module.exports = mongoose.model('Session', SessionSchema);

