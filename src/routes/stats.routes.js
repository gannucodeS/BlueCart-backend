const express = require('express');

const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/admin/dashboard', requireAuth, requireAdmin, async (req, res) => {
  const products = await Product.find({}).lean();
  const orders = await Order.find({}).lean();
  const users = await User.find({ role: { $ne: 'admin' } }).lean();

  const revenue = orders.reduce((a, o) => a + Number(o.total || 0), 0);
  const count = (s) => orders.filter((o) => o.deliveryStatus === s).length;

  return res.json({
    products: products.length,
    orders: orders.length,
    customers: users.length,
    revenue,
    pending: count('Pending'),
    processing: count('Processing'),
    shipped: count('Shipped'),
    outForDel: count('Out for Delivery'),
    delivered: count('Delivered'),
    cancelled: count('Cancelled')
  });
});

module.exports = router;

