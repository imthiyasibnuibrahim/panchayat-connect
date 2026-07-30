const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.post('/apply', certificateController.applyCertificate);
router.get('/status/:applicationNo', certificateController.getCertificateStatus);

module.exports = router;
