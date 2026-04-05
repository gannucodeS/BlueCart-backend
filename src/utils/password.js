const crypto = require('crypto');

// Match the original prototype settings:
// PBKDF2 (100k iterations, SHA-256, 256-bit derived key)
const ITERATIONS = 100000;
const KEYLEN_BYTES = 32;
const DIGEST = 'sha256';

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN_BYTES, DIGEST);
  return JSON.stringify({
    salt: Array.from(salt),
    hash: Array.from(derived)
  });
}

function verifyPassword(password, stored) {
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    return false;
  }
  if (!parsed || !Array.isArray(parsed.salt) || !Array.isArray(parsed.hash)) return false;

  const saltBuf = Buffer.from(parsed.salt);
  const derived = crypto.pbkdf2Sync(password, saltBuf, ITERATIONS, KEYLEN_BYTES, DIGEST);
  return JSON.stringify(Array.from(derived)) === JSON.stringify(parsed.hash);
}

module.exports = { hashPassword, verifyPassword };

