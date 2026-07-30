const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      default: 'vacancy',
      required: true,
    },
    department: { type: String, required: true },
    description: { type: String, required: true },
    qualifications: [{ type: String }],
    locationName: { type: String, required: true },
    stipendOrSalary: { type: String, required: true },
    deadline: { type: Date, required: true },
    category: {
      type: String,
      default: 'General',
    },
    applicants: [
      {
        applicantName: String,
        phone: String,
        qualification: String,
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
