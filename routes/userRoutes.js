const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { 
                $set: {
                    'profile.name': req.body.name,
                    'profile.bio': req.body.bio,
                    'profile.avatar': req.body.avatar
                }
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

module.exports = router;
