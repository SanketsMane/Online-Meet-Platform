const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { isAdminTenant, adminLogin } = require('../middleware/AuthMiddleware');

// Author: Sanket - Public admin login endpoint (no auth middleware)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const result = await adminLogin(email, password);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        return res.status(200).json({ token: result.token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// All routes below require admin Tenant JWT
router.use(isAdminTenant);

module.exports = function (roomList) {
    // Dashboard Stats
    router.get('/stats', (req, res) => AdminController.getStats(req, res, roomList));
    router.get('/stats/system', (req, res) => AdminController.getSystemStats(req, res));

    // Tenant Management
    router.get('/tenants', (req, res) => AdminController.getTenants(req, res));
    router.put('/tenants/:id/status', (req, res) => AdminController.updateTenantStatus(req, res));

    // Room Management
    router.get('/active_rooms', (req, res) => AdminController.getActiveRooms(req, res, roomList));

    // Feedbacks
    router.get('/feedbacks_data', (req, res) => AdminController.getFeedbacks(req, res));

    // Audit Logs
    router.get('/audit-logs', (req, res) => AdminController.getAuditLogs(req, res));

    // API Key Management
    router.get('/api-keys', (req, res) => AdminController.getApiKeys(req, res));
    router.post('/api-keys/:id/revoke', (req, res) => AdminController.revokeApiKey(req, res));

    // Webhook Monitoring
    router.get('/webhooks/logs', (req, res) => AdminController.getWebhookLogs(req, res));

    // Room Management (Enhanced)
    router.post('/rooms/:id/kick', (req, res) => AdminController.kickRoom(req, res, roomList.io));

    // System Settings
    router.get('/settings', (req, res) => AdminController.getSettings(req, res));
    router.put('/settings', (req, res) => AdminController.updateSettings(req, res));

    return router;
};
