const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { isAdmin } = require('../middleware/AuthMiddleware');

router.use(isAdmin);

module.exports = function (roomList) {
    // Dashboard Stats
    router.get('/stats', (req, res) => AdminController.getStats(req, res, roomList));

    // Tenant Management
    router.get('/tenants', (req, res) => AdminController.getTenants(req, res));
    router.put('/tenants/:id/status', (req, res) => AdminController.updateTenantStatus(req, res));

    // Room Management
    router.get('/active_rooms', (req, res) => AdminController.getActiveRooms(req, res, roomList));

    // Feedbacks
    router.get('/feedbacks_data', (req, res) => AdminController.getFeedbacks(req, res));

    // System Settings
    router.get('/settings', (req, res) => AdminController.getSettings(req, res));
    router.put('/settings', (req, res) => AdminController.updateSettings(req, res));

    return router;
};
