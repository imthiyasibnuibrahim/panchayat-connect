const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Streetlight', 'Road & Pothole', 'Water Supply', 'Waste Management', 'Drainage', 'Other'],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    locationAddress: { type: String, required: true },
    imageUrl: { type: String }, // Geo-tagged photo
    citizenName: { type: String, required: true },
    citizenPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved'],
      default: 'Submitted',
    },
    officialRemarks: { type: String, default: 'Ticket logged with Ward Member.' },
  },
  { timestamps: true }
);

grievanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Grievance', grievanceSchema);
