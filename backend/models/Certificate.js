const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    applicationNo: { type: String, unique: true, required: true },
    type: {
      type: String,
      enum: ['Birth Certificate', 'Death Certificate', 'Income Certificate', 'Ownership Certificate', 'Residential Certificate'],
      required: true,
    },
    applicantName: { type: String, required: true },
    applicantPhone: { type: String, required: true },
    aadhaarNo: { type: String, required: true },
    details: { type: Object, default: {} }, // Type-specific payload (e.g., Ward No, House Name)
    status: {
      type: String,
      enum: ['Pending Processing', 'Document Verification', 'Approved & Issued', 'Rejected'],
      default: 'Pending Processing',
    },
    downloadUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
