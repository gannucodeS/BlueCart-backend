const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },

  name: { type: String, required: true },
  category: { type: String, index: true },
  brand: { type: String },
  sku: { type: String, default: '' },

  stock: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  discount: { type: String, default: '' },
  gst: { type: String, default: '18%' },
  description: { type: String, default: '' },

  features: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  storage: { type: [String], default: [] },

  display: { type: String, default: '' },
  processor: { type: String, default: '' },
  battery: { type: String, default: '' },
  connectivity: { type: String, default: '' },
  weight: { type: String, default: '' },
  warranty: { type: String, default: '' },

  imageUrl: { type: String, default: '' }, // Main image (backward compatible)
  images: [{ type: String }], // Array of multiple image URLs
  status: { type: String, default: 'active', index: true },
  badge: { type: String, default: '' },

  createdAt: { type: Date },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('Product', ProductSchema);

