const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Announcement', 'Gram Sabha Meeting', 'Welfare Scheme', 'Tax Alert', 'Health Camp'],
      required: true,
    },
    content: { type: String, required: true },
    publishedDate: { type: Date, default: Date.now },
    isPinned: { type: Boolean, default: false },
    attachmentUrl: { type: String },
    eligibilityCriteria: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
