const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['vacancy', 'internship', 'skill_camp'],
      required: true,
    },
    department: { type: String, required: true }, // e.g. "Data Entry & Digitalization Cell", "ASAP Kerala"
    description: { type: String, required: true },
    qualifications: [{ type: String }],
    locationName: { type: String, required: true }, // e.g. "Panchayat Office - Block B"
    stipendOrSalary: { type: String, required: true }, // e.g. "₹18,000 / month" or "Free Training + Certificate"
    deadline: { type: Date, required: true },
    category: {
      type: String,
      enum: ['Clerical', 'IT & Surveying', 'Tailoring & Craft', 'Electrical', 'Agriculture', 'Environmental'],
      default: 'Clerical',
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
