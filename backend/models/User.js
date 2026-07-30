const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, 'Please provide a valid Indian phone number (+91xxxxxxxxxx)'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['Citizen', 'Seller', 'Authority', 'Admin'],
      default: 'Citizen',
      required: true,
    },
    aadhaarNumber: {
      type: String,
      required: [true, 'Aadhaar Number is required'],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar Number'],
    },
    panchayatName: {
      type: String,
      required: [true, 'Panchayat name is required'],
      index: true,
    },
    wardNumber: {
      type: String,
      required: [true, 'Ward number is required'],
      trim: true,
    },
    houseNumber: {
      type: String,
      required: [true, 'House number is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      default: 'Ernakulam',
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked', 'Pending'],
      default: 'Active',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [76.2711, 10.8505],
      },
    },
    fcmToken: {
      type: String,
      default: null,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
