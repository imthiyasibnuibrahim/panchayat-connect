const Notice = require('../models/Notice');

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ isPinned: -1, publishedDate: -1 });
    return res.status(200).json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch notice board announcements' });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    return res.status(201).json({ success: true, data: notice });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
