const User = require('../models/user.model');
const Product = require('../models/product.model');
const { hashPassword } = require('../utils/password');
const { ADMIN_SECRET } = require('../config/constants');
const seedProducts = require('./seedProducts');

async function ensureSeed() {
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    await User.create({
      firstName: 'Admin',
      lastName: 'BlueCart',
      email: 'admin@bluecart.in',
      phone: '9000000000',
      passwordHash: hashPassword('Admin@123'),
      role: 'admin',
      createdAt: new Date()
    });
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0 && Array.isArray(seedProducts) && seedProducts.length) {
    await Product.insertMany(seedProducts);
  }

  return { ok: true, adminSecretHint: ADMIN_SECRET };
}

module.exports = { ensureSeed };

