const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', noticeController.getNotices);
router.post('/', protect, authorize('Authority', 'Admin'), noticeController.createNotice);

module.exports = router;

