'use strict';

const express = require('express');
const router = express.Router();
const { Tenant, ApiKey, Feedback } = require('../db/models');
const { isAdmin } = require('../middleware/AuthMiddleware');
const settingsService = require('../services/SettingsService');
const Logger = require('../Logger');
const log = new Logger('AdminRoutes');

router.use(isAdmin);

module.exports = function (roomList) {
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
            res.json({
                tenants: tenantCount,
                apiKeys: keyCount,
                activeRooms: roomList ? roomList.size : 0,
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching stats' });
        }
    });

    // Get all feedbacks
    router.get('/feedbacks_data', async (req, res) => {
        try {
            const feedbacks = await Feedback.findAll({
                order: [['timestamp', 'DESC']],
            });
            res.json(feedbacks);
        } catch (err) {
            log.error('Error fetching feedbacks:', err.message);
            res.status(500).json({ message: 'Error fetching feedbacks' });
        }
    });

    // Get System Settings
    router.get('/settings', async (req, res) => {
        try {
            const settings = await settingsService.getAll();
            res.json(settings);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching settings' });
        }
    });

    // Update System Settings
    router.put('/settings', async (req, res) => {
        try {
            const settings = req.body;
            for (const [key, value] of Object.entries(settings)) {
                await settingsService.set(key, value);
            }
            res.json({ message: 'Settings updated successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Error updating settings' });
        }
    });

    return router;
};
