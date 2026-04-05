'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
const bcrypt = require('bcrypt');
const config = require('../config');

// Register Host
router.post('/register', async (req, res) => {
    try {
        const { username, password, displayname } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const password_hash = await bcrypt.hash(password, 10);

        // Create user with default status = 'pending'
        const user = await User.create({
            username,
            password_hash,
            displayname: displayname || username,
            allowed_rooms: ['*'],
            status: 'pending',
            otp_code: otpCode,
            otp_expiry: otpExpiry,
        });

        // Import EmailService here to avoid circular dependencies if any
        const EmailService = require('../services/EmailService');
        
        // Send OTP email
        EmailService.sendOTP({ email: username, name: displayname || username }, otpCode)
            .catch(err => console.error('Registration OTP Send Error:', err));

        res.status(201).json({ 
            message: 'Registration successful. Verification required.', 
            username: user.username,
            verifyRedirect: `/verify-request?email=${username}`
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

module.exports = router;
