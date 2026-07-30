const Grievance = require('../models/Grievance');

exports.submitGrievance = async (req, res) => {
  try {
    const { title, category, description, lng, lat, locationAddress, citizenName, citizenPhone, imageUrl } = req.body;

    const ticketId = 'GRV-' + Math.floor(100000 + Math.random() * 900000);

    const grievance = await Grievance.create({
      ticketId,
      title,
      category,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng || 76.2711), parseFloat(lat || 10.8505)] },
      locationAddress: locationAddress || 'Panchayat Ward 4',
      citizenName,
      citizenPhone,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop',
    });

    return res.status(201).json({
      success: true,
      message: `Grievance registered under Ticket ID #${ticketId}. Ward Member notified!`,
      data: grievance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to submit grievance' });
  }
};

exports.getGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: grievances.length, data: grievances });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch grievances' });
  }
};
