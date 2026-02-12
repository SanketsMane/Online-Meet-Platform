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

        const password_hash = await bcrypt.hash(password, 10);
        
        // Create user with default allowed_rooms = ['*']
        const user = await User.create({
            username,
            password_hash,
            displayname: displayname || username,
            allowed_rooms: ['*']
        });

        res.status(201).json({ message: 'Registration successful', username: user.username });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

module.exports = router;
