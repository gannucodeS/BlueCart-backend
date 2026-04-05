const express = require('express');
const Otp = require('../models/otp.model');
const Order = require('../models/order.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || '';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || '';
const WHATSAPP_FROM = process.env.WHATSAPP_FROM || '';

async function sendWhatsAppMessage(phone, message) {
  if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
    console.log(`[WhatsApp Mock] To: ${phone}`);
    console.log(`[WhatsApp Mock] Message: ${message}`);
    return { success: true, mock: true };
  }
  
  try {
    const fetch = require('node-fetch');
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phone.replace(/[^0-9]/g, ''),
        template: 'delivery_otp',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: message }
            ]
          }
        ]
      })
    });
    
    return { success: response.ok };
  } catch (e) {
    console.error('WhatsApp send error:', e);
    return { success: false, error: e.message };
  }
}

router.post('/generate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'Order ID is required' });
    }
    
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.json({ ok: false, error: 'Order not found' });
    }
    
    const phone = order.userPhone;
    if (!phone || phone.length < 10) {
      return res.json({ ok: false, error: 'Invalid phone number in order' });
    }
    
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const fullPhone = '91' + cleanPhone;
    
    const otp = await Otp.createOtp(orderId, fullPhone);
    
    const message = `Your BlueCart delivery OTP is: ${otp.otp}. Valid for 10 minutes. Share this only with the delivery person.`;
    
    const sendResult = await sendWhatsAppMessage(fullPhone, message);
    
    return res.json({
      ok: true,
      message: sendResult.mock ? 'OTP generated (mock mode)' : 'OTP sent via WhatsApp',
      mock: sendResult.mock || false,
      orderId: orderId,
      expiresAt: otp.expiresAt
    });
  } catch (e) {
    console.error('OTP generation error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to generate OTP' });
  }
});

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    
    if (!orderId || !otp) {
      return res.status(400).json({ ok: false, error: 'Order ID and OTP are required' });
    }
    
    const result = await Otp.verifyOtp(orderId, otp);
    
    if (!result.valid) {
      return res.json({ ok: false, error: result.error });
    }
    
    await Order.findOneAndUpdate(
      { id: orderId },
      { 
        deliveryStatus: 'Delivered',
        deliveredAt: new Date(),
        updatedAt: new Date(),
        deliveryVerified: true
      }
    );
    
    return res.json({ 
      ok: true, 
      message: 'OTP verified successfully. Delivery confirmed.',
      orderId: orderId
    });
  } catch (e) {
    console.error('OTP verification error:', e);
    return res.status(500).json({ ok: false, error: 'OTP verification failed' });
  }
});

router.post('/resend', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'Order ID is required' });
    }
    
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.json({ ok: false, error: 'Order not found' });
    }
    
    const phone = order.userPhone.replace(/[^0-9]/g, '').slice(-10);
    const fullPhone = '91' + phone;
    
    const otp = await Otp.createOtp(orderId, fullPhone);
    
    const message = `Your new BlueCart delivery OTP is: ${otp.otp}. Valid for 10 minutes.`;
    
    const sendResult = await sendWhatsAppMessage(fullPhone, message);
    
    return res.json({
      ok: true,
      message: 'New OTP sent successfully',
      mock: sendResult.mock || false,
      orderId: orderId,
      expiresAt: otp.expiresAt
    });
  } catch (e) {
    console.error('OTP resend error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to resend OTP' });
  }
});

router.get('/status/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const otpDoc = await Otp.findOne({ orderId });
    
    if (!otpDoc) {
      return res.json({ ok: true, status: 'not_generated' });
    }
    
    return res.json({
      ok: true,
      status: otpDoc.verified ? 'verified' : (otpDoc.expiresAt < new Date() ? 'expired' : 'pending'),
      attemptsRemaining: Math.max(0, 3 - otpDoc.attempts),
      expiresAt: otpDoc.expiresAt
    });
  } catch (e) {
    console.error('OTP status error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to check OTP status' });
  }
});

module.exports = router;
