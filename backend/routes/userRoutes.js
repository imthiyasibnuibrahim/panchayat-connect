const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUserByAdmin,
  updateUserRole,
  updateUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes here are restricted strictly to Central Admin
router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getAllUsers)
  .post(createUserByAdmin);

router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

module.exports = router;
