const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');

router.get('/', grievanceController.getGrievances);
router.post('/submit', grievanceController.submitGrievance);

module.exports = router;
