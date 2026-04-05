const express = require('express');

const User = require('../models/user.model');
const Session = require('../models/session.model');
const { hashPassword, verifyPassword } = require('../utils/password');
const { genToken } = require('../utils/ids');
const { ADMIN_SECRET, SESSION_DAYS } = require('../config/constants');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: rawRole,
      adminKey
    } = req.body || {};

    const role = rawRole || 'user';
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!firstName || !lastName || !normalizedEmail || !phone || !password) {
      return res.json({ ok: false, error: 'Missing required fields.' });
    }

    if (role === 'admin' && adminKey !== ADMIN_SECRET) {
      return res.json({ ok: false, error: 'Invalid admin secret key.' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.json({ ok: false, error: 'An account with this email already exists.' });

    await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      passwordHash: hashPassword(password),
      role,
      createdAt: new Date()
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role: rawRole, adminKey } = req.body || {};
    const role = rawRole || 'user';
    const normalizedEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.json({ ok: false, error: 'Invalid email or password.' });

    if (!verifyPassword(password, user.passwordHash)) {
      return res.json({ ok: false, error: 'Invalid email or password.' });
    }

    if (role === 'admin' && user.role !== 'admin') {
      return res.json({ ok: false, error: 'This account does not have admin access.' });
    }
    if (role === 'admin' && adminKey !== ADMIN_SECRET) {
      return res.json({ ok: false, error: 'Invalid admin secret key.' });
    }
    if (role === 'user' && user.role === 'admin') {
      return res.json({ ok: false, error: 'Please use Admin login for admin accounts.' });
    }

    const token = genToken();
    const expiry = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    const sess = await Session.create({
      token,
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      expiry
    });

    return res.json({
      ok: true,
      user: { id: user.id, name: sess.name, email: sess.email, role: sess.role },
      token: sess.token
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Login failed.' });
  }
});

router.get('/session', requireAuth, async (req, res) => {
  return res.json({
    token: req.session.token,
    userId: req.session.userId,
    role: req.session.role,
    email: req.session.email,
    name: req.session.name,
    expiry: req.session.expiry.getTime()
  });
});

router.post('/logout', requireAuth, async (req, res) => {
  await Session.deleteOne({ token: req.session.token }).catch(() => {});
  return res.json({ ok: true });
});

module.exports = router;

