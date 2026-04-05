const Session = require('../models/session.model');

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  return m[1].trim() || null;
}

async function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    const sess = await Session.findOne({ token });
    if (!sess) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    if (sess.expiry < new Date()) {
      await Session.deleteOne({ token }).catch(() => {});
      return res.status(401).json({ ok: false, error: 'Session expired' });
    }

    req.session = sess;
    next();
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.session || req.session.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };

