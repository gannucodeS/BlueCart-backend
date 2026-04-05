const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');
const orderRoutes = require('./routes/orders.routes');
const statsRoutes = require('./routes/stats.routes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/ping', (req, res) => res.json({ ok: true }));

  // API
  app.use('/api/auth', authRoutes);        // /register /login /session /logout
  app.use('/api/products', productRoutes); // public + /admin/*
  app.use('/api/users', userRoutes);       // /admin/*
  app.use('/api/orders', orderRoutes);     // user + /admin/*
  app.use('/api/stats', statsRoutes);      // /admin/*

  // Static frontend (serve the prototype files)
  const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
  app.use(express.static(frontendDir));

  return app;
}

module.exports = { createApp };

