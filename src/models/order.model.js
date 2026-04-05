const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, default: 1 },
    total: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: '' },
    brand: { type: String, default: '' }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },

  userEmail: { type: String, index: true },
  userName: { type: String },
  userPhone: { type: String },

  address: { type: String },
  pincode: { type: String },
  city: { type: String, default: '' },
  state: { type: String, default: '' },

  items: { type: [OrderItemSchema], default: [] },
  itemCount: { type: Number, default: 0 },

  subtotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  deliveryStatus: { type: String, index: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'],
    default: 'Pending',
    index: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Razorpay', 'COD', 'Bank Transfer', 'Online'],
    default: 'Online' 
  },
  paymentData: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    utrNumber: { type: String }
  },

  deliveryVerified: { type: Boolean, default: false },
  otpVerifiedAt: { type: Date },

  placedAt: { type: Date },
  updatedAt: { type: Date },
  expectedBy: { type: String },
  deliveredAt: { type: Date, default: null },
  notes: { type: String, default: '' }
});

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'paymentData.razorpayOrderId': 1 });

module.exports = mongoose.model('Order', OrderSchema);

