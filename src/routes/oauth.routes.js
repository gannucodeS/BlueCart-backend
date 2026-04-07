const express = require('express');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const { hashPassword } = require('../utils/password');
const { genToken } = require('../utils/ids');
const { SESSION_DAYS } = require('../config/constants');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const FIREBASE_PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

async function verifyGoogleToken(idToken) {
  console.log('[Google OAuth] Verify function called, GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  
  const FIREBASE_CREDS_CONFIGURED = FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL;
  console.log('[Google OAuth] Firebase configured:', FIREBASE_CREDS_CONFIGURED);
  
  // Skip Firebase, use tokeninfo directly since we don't have Firebase credentials
  console.log('[Google OAuth] Using tokeninfo API...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const data = await response.json();
    
    console.log('[Google OAuth] Tokeninfo response:', data);
    
    if (data.error) {
      console.error('[Google OAuth] Tokeninfo error:', data.error);
      return null;
    }
    
    // For development, skip audience validation
    // if (GOOGLE_CLIENT_ID && data.aud !== GOOGLE_CLIENT_ID) {
    //   console.error('[Google OAuth] Token audience mismatch');
    //   return null;
    // }
    
    return {
      email: data.email,
      name: data.name || 'Google User',
      uid: data.sub,
      phone_number: null
    };
  } catch (e) {
    console.error('[Google OAuth] Token verification error:', e);
    return null;
  }
}

router.post('/google', async (req, res) => {
  try {
    console.log('[Google OAuth] Received request');
    const { idToken, name, email, phone } = req.body;
    
    if (!idToken) {
      console.log('[Google OAuth] No ID token provided');
      return res.status(400).json({ ok: false, error: 'ID token is required' });
    }
    
    console.log('[Google OAuth] Verifying token...');
    const decodedToken = await verifyGoogleToken(idToken);
    console.log('[Google OAuth] Token verification result:', decodedToken ? 'SUCCESS' : 'FAILED');
    
    if (!decodedToken) {
      return res.json({
        ok: false,
        error: 'Invalid Google token. Please try again.'
      });
    }
    
    const googleEmail = (decodedToken.email || '').toLowerCase().trim();
    
    if (!googleEmail) {
      return res.json({ ok: false, error: 'Email not provided by Google' });
    }
    
    let user = await User.findOne({ email: googleEmail });
    
    if (!user) {
      const nameParts = (decodedToken.name || 'Google User').split(' ');
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      
      const Counter = require('../models/counter.model');
      const counter = await Counter.findByIdAndUpdate(
        'userId',
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      
      user = await User.create({
        id: counter.seq,
        firstName,
        lastName,
        email: googleEmail,
        phone: decodedToken.phone_number || phone || '',
        passwordHash: hashPassword(genToken()),
        role: 'user',
        authProvider: 'google',
        googleId: decodedToken.uid,
        createdAt: new Date()
      });
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
      user: {
        id: user.id,
        name: sess.name,
        email: sess.email,
        role: sess.role
      },
      token: sess.token
    });
  } catch (e) {
    console.error('Google OAuth error:', e);
    return res.status(500).json({ ok: false, error: 'Google sign-in failed. Please try again.' });
  }
});

router.post('/google-link', requireAuth, async (req, res) => {
  try {
    const { idToken } = req.body;
    const sess = req.session;
    
    if (!idToken) {
      return res.status(400).json({ ok: false, error: 'ID token is required' });
    }
    
    const decodedToken = await verifyGoogleToken(idToken);
    
    if (!decodedToken) {
      return res.json({ ok: false, error: 'Invalid Google token' });
    }
    
    const googleEmail = (decodedToken.email || '').toLowerCase().trim();
    
    const existingGoogleUser = await User.findOne({ 
      $or: [
        { googleId: decodedToken.uid },
        { email: googleEmail }
      ]
    });
    
    if (existingGoogleUser && existingGoogleUser.id !== sess.userId) {
      return res.json({ ok: false, error: 'This Google account is already linked to another user' });
    }
    
    await User.findOneAndUpdate(
      { id: sess.userId },
      { 
        googleId: decodedToken.uid,
        authProvider: 'google'
      }
    );
    
    return res.json({ ok: true, message: 'Google account linked successfully' });
  } catch (e) {
    console.error('Google link error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to link Google account' });
  }
});

router.get('/google-config', async (req, res) => {
  console.log('[Google OAuth] google-config called, GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'EMPTY');
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  return res.json({
    configured: !!clientId,
    clientId: clientId
  });
});

module.exports = router;
