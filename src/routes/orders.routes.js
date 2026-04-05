const express = require('express');

const Order = require('../models/order.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { genOrderId } = require('../utils/ids');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const sess = req.session;
    const opts = req.body || {};
    const cartItems = Array.isArray(opts.cartItems) ? opts.cartItems : [];

    if (!opts.userEmail || opts.userEmail.toLowerCase() !== (sess.email || '').toLowerCase()) {
      return res.status(403).json({ ok: false, error: 'Cannot place order for another user.' });
    }

    const subtotal = cartItems.reduce((a, b) => a + Number(b.price || 0) * Number(b.qty || 1), 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;

    const orderId = genOrderId();
    const expectedBy = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');

    const order = await Order.create({
      id: orderId,
      userEmail: opts.userEmail,
      userName: opts.userName,
      userPhone: opts.userPhone,
      address: opts.address,
      pincode: opts.pincode,
      items: cartItems.map((i) => ({
        productId: i.productId || '',
        name: i.name,
        price: Number(i.price || 0),
        qty: Number(i.qty || 1),
        total: Number(i.price || 0) * Number(i.qty || 1),
        imageUrl: i.imageUrl || '',
        category: i.category || '',
        brand: i.brand || ''
      })),
      itemCount: cartItems.length,
      subtotal,
      shipping,
      total,
      deliveryStatus: 'Pending',
      paymentStatus: 'Paid',
      paymentMethod: opts.paymentMethod || 'Online',
      placedAt: new Date(),
      updatedAt: new Date(),
      expectedBy,
      deliveredAt: null,
      notes: ''
    });

    return res.json({ ok: true, orderId: order.id, order });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Order placement failed.' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.session.role === 'admin';
    const { userEmail } = req.query || {};

    if (isAdmin) {
      const orders = await Order.find({}).lean();
      return res.json(orders);
    }

    const email = userEmail || req.session.email;
    if ((email || '').toLowerCase() !== req.session.email.toLowerCase()) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    const orders = await Order.find({ userEmail: email }).lean();
    return res.json(orders);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const isAdmin = req.session.role === 'admin';
  const order = await Order.findOne({ id: req.params.id }).lean();
  if (!order) return res.json(null);
  if (!isAdmin && (order.userEmail || '').toLowerCase() !== req.session.email.toLowerCase()) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  return res.json(order);
});

// Admin
router.patch('/admin/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { deliveryStatus } = req.body || {};
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.json({ ok: false, error: 'Order not found' });

    order.deliveryStatus = deliveryStatus;
    order.updatedAt = new Date();
    if (deliveryStatus === 'Delivered') order.deliveredAt = new Date();
    await order.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Update failed' });
  }
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  await Order.deleteOne({ id: req.params.id }).catch(() => {});
  return res.json({ ok: true });
});

module.exports = router;

