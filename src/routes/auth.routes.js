const express = require('express');

const User = require('../models/user.model');
const Session = require('../models/session.model');
const { hashPassword, verifyPassword } = require('../utils/password');
const { genToken } = require('../utils/ids');
const { SESSION_DAYS } = require('../config/constants');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX.test(cleaned);
}

function normalizePhone(phone) {
  return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '');
}

router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password
    } = req.body || {};

    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!firstName || !lastName) {
      return res.json({ ok: false, error: 'First name and last name are required.', field: 'name' });
    }

    if (!normalizedEmail) {
      return res.json({ ok: false, error: 'Email address is required.', field: 'email' });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.json({ ok: false, error: 'Please enter a valid email address.', field: 'email' });
    }

    if (!phone) {
      return res.json({ ok: false, error: 'Phone number is required.', field: 'phone' });
    }

    if (!validatePhone(phone)) {
      return res.json({ ok: false, error: 'Please enter a valid 10-digit Indian phone number.', field: 'phone' });
    }

    if (!password || password.length < 8) {
      return res.json({ ok: false, error: 'Password must be at least 8 characters.', field: 'password' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.json({ ok: false, error: 'An account with this email already exists.', field: 'email' });

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: normalizePhone(phone),
      passwordHash: hashPassword(password),
      role: 'user',
      authProvider: 'email',
      createdAt: new Date()
    });

    return res.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error('Registration error:', e);
    return res.status(500).json({ ok: false, error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.json({ ok: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.json({ ok: false, error: 'Invalid email or password.' });

    if (!verifyPassword(password, user.passwordHash)) {
      return res.json({ ok: false, error: 'Invalid email or password.' });
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
    console.error('Login error:', e);
    return res.status(500).json({ ok: false, error: 'Login failed. Please try again.' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password, adminKey } = req.body || {};
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password || !adminKey) {
      return res.json({ ok: false, error: 'Email, password, and admin key are required.' });
    }

    const ADMIN_SECRET = require('../config/constants').ADMIN_SECRET;
    if (adminKey !== ADMIN_SECRET) {
      return res.json({ ok: false, error: 'Invalid admin key.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.json({ ok: false, error: 'Invalid email or password.' });

    if (!verifyPassword(password, user.passwordHash)) {
      return res.json({ ok: false, error: 'Invalid email or password.' });
    }

    if (user.role !== 'admin') {
      return res.json({ ok: false, error: 'This account does not have admin access.' });
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
    console.error('Admin login error:', e);
    return res.status(500).json({ ok: false, error: 'Admin login failed. Please try again.' });
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

