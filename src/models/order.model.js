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

  items: { type: [OrderItemSchema], default: [] },
  itemCount: { type: Number, default: 0 },

  subtotal: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  deliveryStatus: { type: String, index: true },
  paymentStatus: { type: String, default: 'Paid' },
  paymentMethod: { type: String, default: 'Online' },

  placedAt: { type: Date },
  updatedAt: { type: Date },
  expectedBy: { type: String },
  deliveredAt: { type: Date, default: null },
  notes: { type: String, default: '' }
});

module.exports = mongoose.model('Order', OrderSchema);

