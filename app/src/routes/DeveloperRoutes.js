'use strict';

const express = require('express');
const router = express.Router();
const { Tenant, ApiKey, UsageLog } = require('../db/models');
const { sequelize } = require('../db/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const crypto = require('crypto');
const { validateApiKey } = require('../middleware/AuthMiddleware');
const EmailService = require('../services/EmailService');

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const existing = await Tenant.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const tenant = await Tenant.create({ name, email, password_hash });

        // Author: Sanket - Send Welcome Email
        EmailService.sendWelcome(tenant).catch(err => console.error('Welcome email failed:', err));

        res.status(201).json({ message: 'Registered successfully', id: tenant.id });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const tenant = await Tenant.findOne({ where: { email } });

        if (!tenant || !(await tenant.checkPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (tenant.status !== 'active') {
            return res.status(403).json({ message: 'Account suspended. Please contact support.' });
        }

        const token = jwt.sign(
            { id: tenant.id, role: tenant.role },
            config.security.jwt.key,
            { expiresIn: '24h' }
        );

        res.json({ token, role: tenant.role, name: tenant.name });
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// Author: Sanket - Send OTP for Login or Password Reset
router.post('/auth/otp/send', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const tenant = await Tenant.findOne({ where: { email } });
        if (!tenant) {
            // Be vague for security, but we'll send a success response anyway to prevent user enumeration
            return res.json({ message: 'If this email exists, an OTP has been sent.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await tenant.update({ otp_code: otp, otp_expiry });

        // Send OTP via Email
        EmailService.sendOTP(tenant, otp).catch(err => console.error('OTP email failed:', err));

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to send OTP', error: err.message });
    }
});

// Author: Sanket - Verify OTP and Login
router.post('/auth/otp/login', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Missing fields' });

        const tenant = await Tenant.findOne({ where: { email } });
        if (!tenant || tenant.otp_code !== otp || new Date() > tenant.otp_expiry) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful use
        await tenant.update({ otp_code: null, otp_expiry: null });

        const token = jwt.sign(
            { id: tenant.id, role: tenant.role },
            config.security.jwt.key,
            { expiresIn: '24h' }
        );

        res.json({ token, role: tenant.role, name: tenant.name });
    } catch (err) {
        res.status(500).json({ message: 'OTP verification failed', error: err.message });
    }
});

// Author: Sanket - Reset Password using OTP
router.post('/auth/password/reset', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Missing fields' });

        const tenant = await Tenant.findOne({ where: { email } });
        if (!tenant || tenant.otp_code !== otp || new Date() > tenant.otp_expiry) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await tenant.update({
            password_hash,
            otp_code: null,
            otp_expiry: null
        });

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Password reset failed', error: err.message });
    }
});

// Usage Stats
router.get('/stats/usage', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, config.security.jwt.key);
        const { UsageLog } = require('../db/models');
        const { Op } = require('sequelize');

        // Get stats for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const logs = await UsageLog.findAll({
            where: {
                tenant_id: decoded.id,
                timestamp: { [Op.gte]: sevenDaysAgo },
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('timestamp')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('timestamp'))],
            order: [[sequelize.fn('DATE', sequelize.col('timestamp')), 'ASC']],
        });

        res.json(logs);
    } catch (err) {
        console.error('Usage stats error:', err);
        res.status(500).json({ message: 'Failed to fetch usage stats' });
    }
});

// Generate API Key
router.post('/keys', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, config.security.jwt.key);
        const tenant_id = decoded.id;

        const { name, scopes } = req.body;
        const rawKey = uuidv4() + '.' + crypto.randomBytes(32).toString('hex');
        const prefix = rawKey.split('.')[0];
        const key_hash = crypto.createHash('sha256').update(rawKey).digest('hex');

        await ApiKey.create({
            tenant_id,
            name: name || 'Default Key',
            prefix,
            key_hash,
            scopes: scopes || [],
            is_active: true,
        });

        res.json({ apiKey: rawKey, message: 'Save this key now! It will not be shown again.' });
    } catch (err) {
         res.status(500).json({ message: 'Failed to generate key', error: err.message });
    }
});

// List Keys
router.get('/keys', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, config.security.jwt.key);
        const keys = await ApiKey.findAll({
            where: { tenant_id: decoded.id },
            attributes: ['id', 'name', 'prefix', 'createdAt', 'last_used_at', 'is_active'],
        });
        res.json(keys);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch keys' });
    }
});

// Author: Sanket - Toggle Key Active Status
router.patch('/keys/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, config.security.jwt.key);
        const { is_active } = req.body;

        const key = await ApiKey.findOne({
            where: { id: req.params.id, tenant_id: decoded.id }
        });

        if (!key) return res.status(404).json({ message: 'Key not found' });

        await key.update({ is_active });

        // Author: Sanket - Send Security Alert
        const tenant = await Tenant.findByPk(decoded.id);
        if (tenant) {
            EmailService.sendSecurityAlert(tenant, is_active ? 'Activated' : 'Revoked', key.name)
                .catch(err => console.error('Security alert email failed:', err));
        }

        res.json({ message: `Key ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update key' });
    }
});

// Author: Sanket - Delete API Key
router.delete('/keys/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, config.security.jwt.key);
        
        const key = await ApiKey.findOne({
            where: { id: req.params.id, tenant_id: decoded.id }
        });

        if (!key) return res.status(404).json({ message: 'Key not found' });

        const keyName = key.name;
        await key.destroy();

        // Author: Sanket - Send Security Alert
        const tenant = await Tenant.findByPk(decoded.id);
        if (tenant) {
            EmailService.sendSecurityAlert(tenant, 'Deleted', keyName)
                .catch(err => console.error('Security alert email failed:', err));
        }

        res.json({ message: 'Key deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete key' });
    }
});

module.exports = router;
