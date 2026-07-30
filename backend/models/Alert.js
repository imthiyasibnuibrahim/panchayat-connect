const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'warning',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Polygon geometry defining the affected geographic region
    affectedArea: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        required: true,
        default: 'Polygon',
      },
      // Array of linear ring coordinate arrays: [[[lng, lat], [lng, lat], ...]]
      coordinates: {
        type: Array,
        required: true,
      },
    },
    panchayatName: {
      type: String,
      required: true,
    },
    evacuationCampInfo: {
      campName: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
      },
      contactPhone: String,
    },
    broadcastChannels: {
      type: [String],
      enum: ['push', 'sms', 'in_app'],
      default: ['push', 'sms', 'in_app'],
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'dispatching', 'active', 'resolved', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for polygon intersection & point-in-polygon queries ($geoIntersects)
alertSchema.index({ affectedArea: '2dsphere' });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
