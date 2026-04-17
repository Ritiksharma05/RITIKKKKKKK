const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get search history
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.recentSearches || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a search (or multiple if array)
router.post('/save', protect, async (req, res) => {
  const { query, category, queries } = req.body;
  try {
    const user = await User.findById(req.user._id);
    user.recentSearches = user.recentSearches || [];

    const addQuery = (qText, cText, time) => {
      // Remove if existing to put it at the front
      user.recentSearches = user.recentSearches.filter(s => s.query.toLowerCase() !== qText.toLowerCase());
      user.recentSearches.unshift({ query: qText, category: cText, timestamp: time || new Date() });
    };

    if (queries && Array.isArray(queries)) {
      queries.forEach(q => addQuery(q.query, q.category, q.timestamp));
    } else if (query) {
      addQuery(query, category, new Date());
    } else {
      return res.status(400).json({ error: 'Provide query or queries array' });
    }

    // Keep only last 20
    if (user.recentSearches.length > 20) {
      user.recentSearches = user.recentSearches.slice(0, 20);
    }

    await user.save();
    res.json(user.recentSearches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all history
router.delete('/clear', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.recentSearches = [];
    await user.save();
    res.json({ success: true, recentSearches: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
