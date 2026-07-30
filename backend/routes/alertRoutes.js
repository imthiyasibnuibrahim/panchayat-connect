const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.post('/broadcast', protect, authorize('Authority', 'Admin'), alertController.createGeoAlert);
router.get('/active-at-location', alertController.getAlertsForLocation);

module.exports = router;

