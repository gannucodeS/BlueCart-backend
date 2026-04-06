const express = require('express');

const Product = require('../models/product.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');
const { genProductId } = require('../utils/ids');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query || {};
    const q = {};
    if (category) q.category = category;
    const products = await Product.find(q).lean();
    return res.json(products);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Search endpoint for live suggestions
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ products: [], categories: [], brands: [] });
    
    const searchRegex = new RegExp(q, 'i');
    
    // Search products by name/brand/category
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ]
    }).select('name category brand price imageUrl').limit(8).lean();
    
    // Get matching categories
    const categories = await Product.distinct('category', { category: searchRegex });
    
    // Get matching brands  
    const brands = await Product.distinct('brand', { brand: searchRegex });
    
    return res.json({ products, categories: categories.slice(0, 5), brands: brands.slice(0, 5) });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Search error' });
  }
});

router.get('/:id', async (req, res) => {
  const p = await Product.findOne({ id: req.params.id }).lean();
  return res.json(p || null);
});

// Admin save (create/update)
router.post('/admin/save', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const id = data.id || genProductId();
    const now = new Date();

    await Product.findOneAndUpdate(
      { id },
      {
        $set: {
          id,
          name: data.name,
          category: data.category,
          brand: data.brand,
          sku: data.sku || '',
          stock: Number(data.stock || 0),
          mrp: Number(data.mrp || 0),
          price: Number(data.price || 0),
          discount: data.discount || '',
          gst: data.gst || '18%',
          description: data.description || '',

          features: Array.isArray(data.features) ? data.features : [],
          colors: Array.isArray(data.colors) ? data.colors : [],
          storage: Array.isArray(data.storage) ? data.storage : [],

          display: data.display || '',
          processor: data.processor || '',
          battery: data.battery || '',
          connectivity: data.connectivity || '',
          weight: data.weight || '',
          warranty: data.warranty || '',

          imageUrl: data.imageUrl || '',
          status: data.status || 'active',
          badge: data.badge || '',

          createdAt: data.createdAt ? new Date(data.createdAt) : (data.createdAt ? new Date(data.createdAt) : undefined),
          updatedAt: now
        }
      },
      { upsert: true }
    );

    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Failed to save product.' });
  }
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  await Product.deleteOne({ id: req.params.id }).catch(() => {});
  return res.json({ ok: true });
});

module.exports = router;

