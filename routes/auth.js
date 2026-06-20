const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'ev_navigator_secret_session_key_2026';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { username, emailOrMobile, password, evModel } = req.body;

    if (!username || !emailOrMobile || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ emailOrMobile: emailOrMobile.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or mobile' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      username,
      emailOrMobile: emailOrMobile.toLowerCase(),
      password: hashedPassword,
      evModel: evModel || 'Standard EV'
    });

    const savedUser = await newUser.save();

    // Create JWT Token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        emailOrMobile: savedUser.emailOrMobile,
        evModel: savedUser.evModel
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ emailOrMobile: emailOrMobile.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        emailOrMobile: user.emailOrMobile,
        evModel: user.evModel
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { emailOrMobile, newPassword } = req.body;

    if (!emailOrMobile || !newPassword) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ emailOrMobile: emailOrMobile.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
