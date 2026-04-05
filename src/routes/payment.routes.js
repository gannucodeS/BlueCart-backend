const express = require('express');
const crypto = require('crypto');
const Order = require('../models/order.model');
const UpiTransaction = require('../models/upiTransaction.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { genOrderId } = require('../utils/ids');

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

router.post('/create-razorpay-order', requireAuth, async (req, res) => {
  try {
    const { amount, items } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ ok: false, error: 'Invalid amount' });
    }
    
    const amountInPaise = Math.round(amount * 100);
    const receipt = 'order_' + Date.now();
    
    constrazorpay = require('razorpay');
    
    var razorpay = new razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: {
        userEmail: req.session.email,
        userName: req.session.name
      }
    });
    
    return res.json({
      ok: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (e) {
    console.error('Razorpay order creation error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to create payment order' });
  }
});

router.post('/verify-razorpay', requireAuth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ ok: false, error: 'Missing payment details' });
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');
    
    if (generatedSignature !== razorpaySignature) {
      return res.json({ ok: false, error: 'Invalid payment signature' });
    }
    
    return res.json({ ok: true, verified: true });
  } catch (e) {
    console.error('Razorpay verification error:', e);
    return res.status(500).json({ ok: false, error: 'Payment verification failed' });
  }
});

router.post('/verify-utr', requireAuth, async (req, res) => {
  try {
    const { utr, amount } = req.body;
    
    if (!utr) {
      return res.status(400).json({ ok: false, error: 'UTR number is required' });
    }
    
    if (!/^[0-9]{12}$/.test(utr)) {
      return res.json({ 
        ok: false, 
        error: 'Invalid UTR format. UTR should be 12 digits.',
        field: 'utr'
      });
    }
    
    if (!amount || amount < 1) {
      return res.status(400).json({ ok: false, error: 'Invalid amount' });
    }
    
    const result = await UpiTransaction.verifyUtr(utr, amount);
    
    if (!result.valid) {
      return res.json({ ok: false, error: result.error, field: 'utr' });
    }
    
    return res.json({ ok: true, verified: true, transaction: result.transaction });
  } catch (e) {
    console.error('UTR verification error:', e);
    return res.status(500).json({ ok: false, error: 'UTR verification failed' });
  }
});

router.post('/mark-utr-used', requireAuth, async (req, res) => {
  try {
    const { utr, orderId } = req.body;
    
    if (!utr || !orderId) {
      return res.status(400).json({ ok: false, error: 'UTR and orderId are required' });
    }
    
    const success = await UpiTransaction.markAsUsed(utr, orderId);
    
    if (!success) {
      return res.json({ ok: false, error: 'Failed to mark UTR as used. It may have been used already.' });
    }
    
    return res.json({ ok: true });
  } catch (e) {
    console.error('Mark UTR used error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to update UTR status' });
  }
});

router.post('/create-razorpay-order-guest', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 1) {
      return res.status(400).json({ ok: false, error: 'Invalid amount' });
    }
    
    const amountInPaise = Math.round(amount * 100);
    const receipt = 'guest_' + Date.now();
    
    const razorpay = require('razorpay');
    var instance = new razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    
    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: {
        type: 'guest'
      }
    });
    
    return res.json({
      ok: true,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID
    });
  } catch (e) {
    console.error('Razorpay guest order creation error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to create payment order' });
  }
});

router.post('/seed-utr', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { count = 10, amount = 1000 } = req.body;
    
    const utrs = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      const utr = Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      utrs.push({
        utr,
        amount,
        status: 'unused',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
    
    await UpiTransaction.insertMany(utrs, { ordered: false });
    
    return res.json({ ok: true, count: utrs.length, sampleUtrs: utrs.slice(0, 3).map(u => u.utr) });
  } catch (e) {
    console.error('Seed UTR error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to seed UTRs' });
  }
});

router.get('/bank-details', async (req, res) => {
  return res.json({
    ok: true,
    bankDetails: {
      accountName: 'BlueCart E-Commerce',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'XXXXXXXXXXXX',
      ifsc: process.env.BANK_IFSC || 'XXXX0000000',
      bankName: process.env.BANK_NAME || 'Sample Bank',
      upiId: process.env.UPI_ID || 'bluecart@upi'
    }
  });
});

module.exports = router;
