const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/', jobController.getAllJobs);
router.post('/', jobController.createJobListing);
router.post('/:jobId/apply', jobController.applyForJob);

module.exports = router;
