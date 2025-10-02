const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // Create a user object to send back, using the toJSON transform from the model
    const userResponse = user.toJSON();

    res.status(statusCode).json({ success: true, token, user: userResponse });
};

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, password, role } = req.body;
    try {
        const user = await User.create({ name, password, role });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ message: 'Could not register user. Name might already exist.' });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: 'Please provide a name and password' });
    }
    
    try {
        const user = await User.findOne({ name }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
