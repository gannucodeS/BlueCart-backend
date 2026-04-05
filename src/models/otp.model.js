const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.statics.generateOtp = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

OtpSchema.statics.createOtp = async function(orderId, phone) {
  await this.deleteMany({ orderId });
  
  const otp = this.generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  const otpDoc = await this.create({
    orderId,
    phone,
    otp,
    expiresAt,
    attempts: 0,
    verified: false
  });
  
  return otp;
};

OtpSchema.statics.verifyOtp = async function(orderId, otp) {
  const otpDoc = await this.findOne({ orderId });
  
  if (!otpDoc) {
    return { valid: false, error: 'No OTP found for this order. Please request a new OTP.' };
  }
  
  if (otpDoc.verified) {
    return { valid: false, error: 'This OTP has already been verified.' };
  }
  
  if (otpDoc.expiresAt < new Date()) {
    return { valid: false, error: 'OTP has expired. Please request a new OTP.' };
  }
  
  if (otpDoc.attempts >= 3) {
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }
  
  if (otpDoc.otp !== otp.toString().trim()) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    const remaining = 3 - otpDoc.attempts;
    return { valid: false, error: `Incorrect OTP. ${remaining} attempt(s) remaining.` };
  }
  
  otpDoc.verified = true;
  await otpDoc.save();
  
  return { valid: true, otpDoc };
};

module.exports = mongoose.model('Otp', OtpSchema);
