'use strict';

const express = require('express');
const router = express.Router();
const { Tenant, ApiKey } = require('../db/models');
const { isAdmin } = require('../middleware/AuthMiddleware');

router.use(isAdmin);

// Get all tenants
router.get('/tenants', async (req, res) => {
    try {
        const tenants = await Tenant.findAll({
            attributes: ['id', 'name', 'email', 'role', 'plan', 'status', 'createdAt'],
        });
        res.json(tenants);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tenants' });
    }
});

// Update Tenant Status (Ban/Unban)
router.put('/tenants/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const tenant = await Tenant.findByPk(req.params.id);
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        tenant.status = status;
        await tenant.save();

        res.json({ message: `Tenant status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating tenant' });
    }
});

// System Stats
router.get('/stats', async (req, res) => {
    try {
        const tenantCount = await Tenant.count();
        const keyCount = await ApiKey.count();
        // Mock stats for now, can be connected to real usage later
        res.json({
            tenants: tenantCount,
            apiKeys: keyCount,
            activeRooms: 0, // Placeholder
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
