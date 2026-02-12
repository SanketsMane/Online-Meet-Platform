'use strict';

const { Tenant, ApiKey, Feedback, GlobalSetting } = require('../db/models');
const settingsService = require('../services/SettingsService');
const Logger = require('../Logger');
const log = new Logger('AdminController');

/**
 * AdminController - Centralized administrative logic
 * Author: Sanket
 */
class AdminController {
    /**
     * Get system-wide overview statistics
     */
    static async getStats(req, res, roomList) {
        try {
            const tenantCount = await Tenant.count();
            const keyCount = await ApiKey.count();
            const feedbackCount = await Feedback.count();
            
            res.json({
                tenants: tenantCount,
                apiKeys: keyCount,
                feedbacks: feedbackCount,
                activeRooms: roomList ? roomList.size : 0,
            });
        } catch (err) {
            log.error('Error fetching stats:', err.message);
            res.status(500).json({ message: 'Error fetching statistics' });
        }
    }

    /**
     * Get all registered tenants (developers)
     */
    static async getTenants(req, res) {
        try {
            const tenants = await Tenant.findAll({
                attributes: ['id', 'name', 'email', 'role', 'plan', 'status', 'createdAt'],
                order: [['createdAt', 'DESC']],
            });
            res.json(tenants);
        } catch (err) {
            log.error('Error fetching tenants:', err.message);
            res.status(500).json({ message: 'Error fetching tenants' });
        }
    }

    /**
     * Update tenant status (ban/unban)
     */
    static async updateTenantStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            const tenant = await Tenant.findByPk(id);
            if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

            tenant.status = status;
            await tenant.save();

            log.info(`Tenant ${id} status updated to ${status}`);
            res.json({ message: `Tenant status updated to ${status}` });
        } catch (err) {
            log.error('Error updating tenant status:', err.message);
            res.status(500).json({ message: 'Error updating status' });
        }
    }

    /**
     * Get system settings
     */
    static async getSettings(req, res) {
        try {
            const settings = await settingsService.getAll();
            res.json(settings);
        } catch (err) {
            log.error('Error fetching settings:', err.message);
            res.status(500).json({ message: 'Error fetching settings' });
        }
    }

    /**
     * Update system settings
     */
    static async updateSettings(req, res) {
        try {
            const settings = req.body;
            for (const [key, value] of Object.entries(settings)) {
                await settingsService.set(key, value);
            }
            res.json({ message: 'Settings updated successfully' });
        } catch (err) {
            log.error('Error updating settings:', err.message);
            res.status(500).json({ message: 'Error updating settings' });
        }
    }

    /**
     * Get all feedbacks
     */
    static async getFeedbacks(req, res) {
        try {
            const feedbacks = await Feedback.findAll({
                order: [['timestamp', 'DESC']],
            });
            res.json(feedbacks);
        } catch (err) {
            log.error('Error fetching feedbacks:', err.message);
            res.status(500).json({ message: 'Error fetching feedbacks' });
        }
    }

    /**
     * Get active rooms from memory
     */
    static async getActiveRooms(req, res, roomList) {
        try {
            if (!roomList) return res.json([]);
            
            const rooms = Array.from(roomList.values()).map(room => ({
                id: room.id,
                peers: room.peers.size,
                locked: room.locked,
                broadcasting: room.broadcasting,
                createdAt: room.createdAt || new Date(), // Assuming room object might have this
            }));
            
            res.json(rooms);
        } catch (err) {
            log.error('Error fetching active rooms:', err.message);
            res.status(500).json({ message: 'Error fetching active rooms' });
        }
    }
}

module.exports = AdminController;
