const User = require('../models/User');
const jwt = require('jsonwebtoken');

// In-memory OTP storage for pre-registration phone verification
const otpStore = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

/**
 * @desc Send OTP to user phone number for verification
 * @route POST /api/v1/auth/send-otp
 * @access Public
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    // Check if phone number is already registered (Strict ONE ACCOUNT PER PHONE NUMBER rule)
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is already registered to another account. One account per phone number is enforced.',
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phoneNumber, { otpCode, otpExpires });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`,
      // Returned in demo mode for instant developer/user testing
      otpCode,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Verify OTP code
 * @route POST /api/v1/auth/verify-otp
 * @access Public
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;

    if (!phoneNumber || !otpCode) {
      return res.status(400).json({ success: false, error: 'Phone number and OTP code are required' });
    }

    const storedData = otpStore.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({ success: false, error: 'No OTP requested for this phone number' });
    }

    if (Date.now() > storedData.otpExpires) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new OTP' });
    }

    if (storedData.otpCode !== otpCode.toString()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code. Please try again.' });
    }

    // Mark verified in store
    otpStore.set(phoneNumber, { ...storedData, verified: true });

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Register user with mandatory citizen data collection (Ward, House, Aadhaar) & OTP verification
 * @route POST /api/v1/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
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

    // Validate mandatory data collection
    if (!name || !phoneNumber || !password || !wardNumber || !houseNumber || !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory fields missing: Name, Phone Number, Password, Ward Number, House Number, and 12-digit Aadhaar Number are strictly required.',
      });
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber.toString().trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Aadhaar Number: Must be exactly 12 digits.',
      });
    }

    // Enforce ONE ACCOUNT PER PHONE NUMBER rule
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        error: 'Strict Policy Violation: An account is already registered with this Phone Number.',
      });
    }

    // Enforce Unique Aadhaar rule
    const aadhaarExists = await User.findOne({ aadhaarNumber });
    if (aadhaarExists) {
      return res.status(400).json({
        success: false,
        error: 'Strict Policy Violation: An account is already registered with this Aadhaar Number.',
      });
    }

    // Check OTP verification status
    const storedOtp = otpStore.get(phoneNumber);
    const isPhoneVerified = storedOtp ? !!storedOtp.verified : true; // default true if direct registration

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
      isPhoneVerified,
      status: 'Active',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng || 76.2711), parseFloat(lat || 10.8505)],
      },
    });

    // Clear OTP store
    otpStore.delete(phoneNumber);

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      token,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, error: 'Please provide phone number and password' });
    }

    const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'Revoked') {
      return res.status(403).json({
        success: false,
        error: 'Access Revoked: Your account has been disabled by the central Admin.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc Get authenticated user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(444).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

