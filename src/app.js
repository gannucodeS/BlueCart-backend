const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');
const orderRoutes = require('./routes/orders.routes');
const statsRoutes = require('./routes/stats.routes');
const paymentRoutes = require('./routes/payment.routes');
const locationRoutes = require('./routes/location.routes');
const otpRoutes = require('./routes/otp.routes');
const oauthRoutes = require('./routes/oauth.routes');
const healthRoutes = require('./routes/health.routes');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [FRONTEND_URL, /https:\/\/.*\.vercel\.app$/]
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/ping', (req, res) => res.json({ ok: true }));

  // API Routes
  app.use('/api/health', healthRoutes);        // Health check
  app.use('/api/auth', authRoutes);           // /register /login /admin/login /session /logout
  app.use('/api/products', productRoutes);    // public + /admin/*
  app.use('/api/users', userRoutes);           // /admin/*
  app.use('/api/orders', orderRoutes);        // user + /admin/*
  app.use('/api/stats', statsRoutes);         // /admin/*
  app.use('/api/payment', paymentRoutes);    // /verify-utr /verify-razorpay /create-razorpay-order
  app.use('/api/location', locationRoutes);  // /pincode /states /cities
  app.use('/api/otp', otpRoutes);            // /generate /verify /resend
  app.use('/api/oauth', oauthRoutes);         // /google /google-config

  // Static frontend (serve the prototype files)
  const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

  return app;
}

module.exports = { createApp };

