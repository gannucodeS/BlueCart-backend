const User = require('../models/user.model');
const Product = require('../models/product.model');
const { hashPassword } = require('../utils/password');
const { ADMIN_SECRET } = require('../config/constants');
const { resetCounters } = require('../utils/ids');
const seedProducts = require('./seedProducts');
const migrateStaticProducts = require('./migrateStaticProducts');

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

  // Reset counters for fresh ID generation
  resetCounters();
  
  // Clear all products to regenerate with new IDs
  const deletedCount = await Product.deleteMany({});
  console.log(`Cleared ${deletedCount.deletedCount} products`);
  
  // Reset counters again after delete
  resetCounters();
  
  // Insert seed products with new IDs
  if (Array.isArray(seedProducts) && seedProducts.length) {
    await Product.insertMany(seedProducts);
    console.log(`Inserted ${seedProducts.length} seed products`);
  }
  
  // Run static products migration to add more products
  console.log('Running static products migration...');
  try {
    await migrateStaticProducts();
  } catch(e) {
    console.error('Migration error:', e.message);
  }

  return { ok: true, adminSecretHint: ADMIN_SECRET };
}

module.exports = { ensureSeed };

