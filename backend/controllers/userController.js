const User = require('../models/User');

/**
 * @desc Get all registered users (Central Admin)
 * @route GET /api/v1/users
 * @access Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { aadhaarNumber: { $regex: search, $options: 'i' } },
        { wardNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Create user account directly by Central Admin
 * @route POST /api/v1/users
 * @access Private (Admin only)
 */
exports.createUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      password,
      role,
      panchayatName,
      wardNumber,
      houseNumber,
      aadhaarNumber,
      district,
      lng,
      lat,
    } = req.body;

    if (!name || !phoneNumber || !password || !wardNumber || !houseNumber || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory fields missing: Name, Phone Number, Password, Ward Number, House Number, and Aadhaar Number.',
      });
    }

    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({ success: false, error: 'Phone number already registered' });
    }

    const aadhaarExists = await User.findOne({ aadhaarNumber });
    if (aadhaarExists) {
      return res.status(400).json({ success: false, error: 'Aadhaar number already registered' });
    }

    const user = await User.create({
      name,
      phoneNumber,
      password,
      role: role || 'Citizen',
      panchayatName: panchayatName || 'Ward 4 Panchayat',
      wardNumber: wardNumber.toString().trim(),
      houseNumber: houseNumber.toString().trim(),
      aadhaarNumber: aadhaarNumber.toString().trim(),
      district: district || 'Ernakulam',
      isPhoneVerified: true,
      status: 'Active',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng || 76.2711), parseFloat(lat || 10.8505)],
      },
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: `Account created successfully with role '${user.role}'`,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc Update User Role (Central Admin role assignment)
 * @route PATCH /api/v1/users/:id/role
 * @access Private (Admin only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['Citizen', 'Seller', 'Authority', 'Admin'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role specified. Allowed roles are: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Role for ${user.name} successfully updated to '${role}'`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Revoke or Restore User Access (Central Admin)
 * @route PATCH /api/v1/users/:id/status
 * @access Private (Admin only)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Active', 'Revoked', 'Pending'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent Admin from revoking self
    if (user._id.toString() === req.user.id.toString() && status === 'Revoked') {
      return res.status(400).json({
        success: false,
        error: 'Security Error: Central Admin cannot revoke their own active access.',
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status for ${user.name} changed to '${status}'`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
