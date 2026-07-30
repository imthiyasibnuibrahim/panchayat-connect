const Certificate = require('../models/Certificate');

exports.applyCertificate = async (req, res) => {
  try {
    const { type, applicantName, applicantPhone, aadhaarNo, details } = req.body;
    const applicationNo = 'CERT-' + Date.now().toString().slice(-6);

    const certificate = await Certificate.create({
      applicationNo,
      type,
      applicantName,
      applicantPhone,
      aadhaarNo,
      details,
    });

    return res.status(201).json({
      success: true,
      message: `Digital Certificate Application #${applicationNo} submitted successfully!`,
      data: certificate,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Certificate application error' });
  }
};

exports.getCertificateStatus = async (req, res) => {
  try {
    const { applicationNo } = req.params;
    const cert = await Certificate.findOne({ applicationNo });

    if (!cert) {
      return res.status(404).json({ success: false, error: 'Application number not found' });
    }

    return res.status(200).json({ success: true, data: cert });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to look up application' });
  }
};
