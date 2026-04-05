const mongoose = require('mongoose');
const Counter = require('./counter.model');

const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true }, // keep numeric id (admin.html deletes by numeric id)
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('validate', async function (next) {
  try {
    if (this.id != null) return next();
    const counter = await Counter.findByIdAndUpdate(
      'userId',
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.id = counter.seq;
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model('User', UserSchema);

