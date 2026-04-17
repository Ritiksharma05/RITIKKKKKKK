const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// Apply middleware to all routes in this file
router.use(isAuthenticatedUser);
router.use(authorizeRoles('admin'));

// @route   GET /api/admin/users
// @desc    Get all users with search, sort, and pagination
router.get('/users', async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    let sortQuery = {};
    if (sort === 'oldest') {
      sortQuery.createdAt = 1;
    } else if (sort === 'newest') {
      sortQuery.createdAt = -1;
    } else if (sort === 'lastLogin') {
      sortQuery.lastLoginAt = -1;
    } else {
      sortQuery.createdAt = -1; // Default
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');

    res.status(200).json({
      success: true,
      totalUsers,
      users,
      page: Number(page),
      pages: Math.ceil(totalUsers / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/user/:id/ban
// @desc    Ban or unban a user
router.put('/user/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot ban yourself' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isBanned ? 'banned' : 'unbanned'}`,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/stats
// @desc    Get total user count
router.get('/stats', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
