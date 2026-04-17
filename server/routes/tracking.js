const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Ping endpoint
router.post('/ping', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.lastActiveAt = new Date();
      user.isOnline = true;
      await user.save();
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
