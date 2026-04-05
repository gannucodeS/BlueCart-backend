const crypto = require('crypto');

function genToken() {
  return Array.from(crypto.randomBytes(32))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function genProductId() {
  return 'PRD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function genOrderId() {
  const d = new Date();
  return (
    'ORD-' +
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    '-' +
    Math.floor(Math.random() * 9000 + 1000)
  );
}

module.exports = { genToken, genProductId, genOrderId };

