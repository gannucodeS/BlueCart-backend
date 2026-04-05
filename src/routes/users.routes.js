const express = require('express');

const User = require('../models/user.model');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const users = await User.find({}).lean();
  return res.json(
    users.map((u) => ({
      ...u,
      passwordHash: '***'
    }))
  );
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await User.deleteOne({ id }).catch(() => {});
  return res.json({ ok: true });
});

module.exports = router;

