const mongoose = require('mongoose');

const UpiTransactionSchema = new mongoose.Schema({
  utr: {
    type: String,
    required: true,
    unique: true,
    index: true,
    match: /^[0-9]{12}$/
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['unused', 'used', 'refunded', 'expired'],
    default: 'unused'
  },
  orderId: {
    type: String,
    default: null
  },
  paidBy: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
});

UpiTransactionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

UpiTransactionSchema.statics.verifyUtr = async function(utr, amount) {
  const transaction = await this.findOne({ utr: utr.toString().trim() });
  
  if (!transaction) {
    return { valid: false, error: 'UTR not found in our records. Please verify the UTR number.' };
  }
  
  if (transaction.status === 'used') {
    return { valid: false, error: 'This UTR has already been used for another transaction.' };
  }
  
  if (transaction.status === 'expired' || (transaction.expiresAt && transaction.expiresAt < new Date())) {
    return { valid: false, error: 'This UTR has expired. Please use a recent transaction.' };
  }
  
  if (transaction.amount !== amount) {
    return { valid: false, error: `Amount mismatch. Expected ₹${amount}, but transaction shows ₹${transaction.amount}.` };
  }
  
  return { valid: true, transaction };
};

UpiTransactionSchema.statics.markAsUsed = async function(utr, orderId) {
  const result = await this.findOneAndUpdate(
    { utr: utr.toString().trim(), status: 'unused' },
    { status: 'used', orderId: orderId, usedAt: new Date() },
    { new: true }
  );
  
  return result !== null;
};

module.exports = mongoose.model('UpiTransaction', UpiTransactionSchema);
