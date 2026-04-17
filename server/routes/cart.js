const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user cart
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find(c => c.productId.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity, addedAt: new Date() });
    }
    
    await user.save();
    await user.populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
router.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const item = user.cart.find(c => c.productId.toString() === productId);
    
    if (item) {
      if (quantity <= 0) {
        user.cart = user.cart.filter(c => c.productId.toString() !== productId);
      } else {
        item.quantity = quantity;
      }
      await user.save();
    }
    
    await user.populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(c => c.productId.toString() !== req.params.productId);
    await user.save();
    
    await user.populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Merge cart from local storage
router.post('/merge', protect, async (req, res) => {
  const { localCart } = req.body; // array of { productId, quantity }
  if (!Array.isArray(localCart)) return res.status(400).json({ error: 'localCart must be an array' });

  try {
    const user = await User.findById(req.user._id);
    
    localCart.forEach(localItem => {
      const existing = user.cart.find(c => c.productId.toString() === localItem.productId);
      if (existing) {
        // Keep higher quantity
        if (localItem.quantity > existing.quantity) {
          existing.quantity = localItem.quantity;
        }
      } else {
        user.cart.push({ productId: localItem.productId, quantity: localItem.quantity, addedAt: new Date() });
      }
    });

    await user.save();
    await user.populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
