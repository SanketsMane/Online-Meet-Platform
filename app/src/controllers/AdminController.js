'use strict';

const { Tenant, ApiKey, Feedback, GlobalSetting, AuditLog, WebhookLog, Page } = require('../db/models');
const settingsService = require('../services/SettingsService');
const statsService = require('../services/StatsService');
const EmailService = require('../services/EmailService');
const checkXSS = require('../XSS');
const Logger = require('../Logger');
const log = new Logger('AdminController');

// Author: Sanket - Log Admin Action helper
async function logAdminAction(req, action, target, details = '') {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        let adminId = 'Admin';
        if (req.admin && req.admin.username) adminId = req.admin.username;

        await AuditLog.create({
            admin_id: adminId,
            action: action,
            target: target,
            details: details,
            ip_address: ip,
        });
    } catch (e) {
        log.error('Failed to log admin action:', e.message);
    }
}

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
     * Get real-time system metrics (CPU/Memory)
     */
    static async getSystemStats(req, res) {
        try {
            const stats = await statsService.getSystemStats();
            res.json(stats);
        } catch (err) {
            log.error('Error fetching system stats:', err.message);
            res.status(500).json({ message: 'Error fetching system statistics' });
        }
    }

    /**
     * Get all registered tenants (developers)
     */
    static async getTenants(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const tenants = await Tenant.findAll({
                attributes: ['id', 'name', 'email', 'role', 'plan', 'status', 'createdAt'],
                limit: limit,
                offset: offset,
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

            // Author: Sanket - Trigger Incidence Alert
            EmailService.sendIncidentAlert({
                event: 'TENANT_STATUS_CHANGE',
                details: `Tenant ${id} status changed to ${status} by admin`,
                severity: 'Medium',
            }).catch((err) => log.error('Incident alert failed:', err));

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

            // Author: Sanket - Trigger Incidence Alert
            EmailService.sendIncidentAlert({
                event: 'SYSTEM_SETTINGS_UPDATE',
                details: `Global system settings were updated by admin`,
                severity: 'Low',
            }).catch((err) => log.error('Incident alert failed:', err));
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
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const feedbacks = await Feedback.findAll({
                limit: limit,
                offset: offset,
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

            const rooms = Array.from(roomList.values()).map((room) => ({
                id: room.id,
                peers: room.peers.size,
                locked: room.locked,
                broadcasting: room.broadcasting,
                createdAt: room.createdAt || new Date(),
            }));

            res.json(rooms);
        } catch (err) {
            log.error('Error fetching active rooms:', err.message);
            res.status(500).json({ message: 'Error fetching active rooms' });
        }
    }

    /**
     * Get audit logs
     */
    static async getAuditLogs(req, res) {
        try {
            const logs = await AuditLog.findAll({
                limit: 100,
                order: [['createdAt', 'DESC']],
            });
            res.json(logs);
        } catch (err) {
            log.error('Error fetching audit logs:', err.message);
            res.status(500).json({ message: 'Error fetching audit logs' });
        }
    }

    /**
     * Get all API keys
     */
    static async getApiKeys(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const keys = await ApiKey.findAll({
                include: [{ model: Tenant, attributes: ['name', 'email'] }],
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']],
            });
            res.json(keys);
        } catch (err) {
            log.error('Error fetching API keys:', err.message);
            res.status(500).json({ message: 'Error fetching API keys' });
        }
    }

    /**
     * Revoke an API key
     */
    static async revokeApiKey(req, res) {
        try {
            const { id } = req.params;
            const apiKey = await ApiKey.findByPk(id);
            if (!apiKey) return res.status(404).json({ message: 'API Key not found' });

            apiKey.is_active = false;
            await apiKey.save();

            await logAdminAction(req, 'REVOKE_API_KEY', apiKey.prefix, `Key ID: ${id}`);

            // Author: Sanket - Trigger Incidence Alert
            EmailService.sendIncidentAlert({
                event: 'API_KEY_REVOKED',
                details: `API Key ${apiKey.prefix} was revoked by admin`,
                severity: 'High',
            }).catch((err) => log.error('Incident alert failed:', err));

            res.json({ success: true });
        } catch (err) {
            log.error('Error revoking API key:', err.message);
            res.status(500).json({ message: 'Error revoking API key' });
        }
    }

    /**
     * Get webhook delivery logs
     */
    static async getWebhookLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const logs = await WebhookLog.findAll({
                limit: limit,
                offset: offset,
                order: [['timestamp', 'DESC']],
            });
            res.json(logs);
        } catch (err) {
            log.error('Error fetching webhook logs:', err.message);
            res.status(500).json({ message: 'Error fetching webhook logs' });
        }
    }

    /**
     * Kick all participants from a room (Close Room)
     */
    static async kickRoom(req, res, io) {
        try {
            const { id } = req.params;
            if (io) {
                io.to(id).emit('kick-peer', { message: 'This room has been closed by an administrator.' });
                await logAdminAction(req, 'KICK_ROOM', id, 'Closed all participants');

                // Author: Sanket - Trigger Incidence Alert
                EmailService.sendIncidentAlert({
                    event: 'ROOM_FORCE_CLOSED',
                    details: `Room ${id} was forcefully closed by admin`,
                    severity: 'Medium',
                }).catch((err) => log.error('Incident alert failed:', err));

                res.json({ success: true });
            } else {
                res.status(503).json({ message: 'Socket service unavailable' });
            }
        } catch (err) {
            log.error('Error kicking room:', err.message);
            res.status(500).json({ message: 'Error closing room' });
        }
    }

    /**
     * CMS Page Management
     * Author: Sanket
     */
    static async getPages(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const pages = await Page.findAll({
                limit: limit,
                offset: offset,
                order: [['updatedAt', 'DESC']]
            });
            res.json(pages);
        } catch (err) {
            log.error('Error fetching pages:', err.message);
            res.status(500).json({ message: 'Error fetching pages' });
        }
    }

    static async getPage(req, res) {
        try {
            const page = await Page.findByPk(req.params.id);
            if (!page) return res.status(404).json({ message: 'Page not found' });
            res.json(page);
        } catch (err) {
            log.error('Error fetching page:', err.message);
            res.status(500).json({ message: 'Error fetching page' });
        }
    }

    static async createPage(req, res) {
        try {
            let { title, slug, content, is_published } = req.body;
            
            // Author: Sanket - Sanitize content for XSS prevention
            content = checkXSS(content);
            if (content === null) throw new Error('Invalid content detected');

            const page = await Page.create({ title, slug, content, is_published });
            await logAdminAction(req, 'CREATE_PAGE', slug, `Title: ${title}`);
            res.json(page);
        } catch (err) {
            log.error('Error creating page:', err.message);
            res.status(500).json({ message: 'Error creating page (Slug might already exist)' });
        }
    }

    static async updatePage(req, res) {
        try {
            const { id } = req.params;
            let { title, slug, content, is_published } = req.body;
            
            // Author: Sanket - Sanitize content for XSS prevention
            content = checkXSS(content);
            if (content === null) throw new Error('Invalid content detected');

            const page = await Page.findByPk(id);
            if (!page) return res.status(404).json({ message: 'Page not found' });

            await page.update({ title, slug, content, is_published });
            await logAdminAction(req, 'UPDATE_PAGE', slug, `Title: ${title}`);
            res.json(page);
        } catch (err) {
            log.error('Error updating page:', err.message);
            res.status(500).json({ message: 'Error updating page' });
        }
    }

    static async deletePage(req, res) {
        try {
            const { id } = req.params;
            const page = await Page.findByPk(id);
            if (!page) return res.status(404).json({ message: 'Page not found' });

            const slug = page.slug;
            await page.destroy();
            await logAdminAction(req, 'DELETE_PAGE', slug);
            res.json({ message: 'Page deleted successfully' });
        } catch (err) {
            log.error('Error deleting page:', err.message);
            res.status(500).json({ message: 'Error deleting page' });
        }
    }

    //Sanket v2.0 - Handle logo and favicon file uploads, persist URL to GlobalSetting
    static async uploadBrandingAsset(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const type = req.params.type; // 'logo' or 'favicon'
            if (!['logo', 'favicon'].includes(type)) {
                return res.status(400).json({ message: 'Invalid asset type' });
            }

            const settingKey = type === 'logo' ? 'logo_url' : 'favicon_url';
            const publicUrl = '/uploads/branding/' + req.file.filename;

            await settingsService.set(settingKey, publicUrl);
            await logAdminAction(req, 'UPLOAD_BRANDING', type, `Uploaded: ${req.file.filename}`);

            log.info(`Branding ${type} uploaded: ${publicUrl}`);
            res.json({ success: true, url: publicUrl });
        } catch (err) {
            log.error('Error uploading branding asset:', err.message);
            res.status(500).json({ message: 'Error uploading file' });
        }
    }
}

module.exports = AdminController;
