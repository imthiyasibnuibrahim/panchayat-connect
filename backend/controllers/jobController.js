const Job = require('../models/Job');

exports.getAllJobs = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { status: 'active' };
    if (type) filter.type = type;
    if (category) filter.category = category;

    const jobs = await Job.find(filter).sort({ deadline: 1 });
    return res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch job listings' });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applicantName, phone, qualification } = req.body;

    if (!applicantName || !phone) {
      return res.status(400).json({ success: false, error: 'Applicant name and phone number required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job listing not found' });
    }

    job.applicants.push({ applicantName, phone, qualification });
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Successfully applied for ${job.title}! Application logged under Panchayat Registry.`,
      data: job,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Job application processing failed' });
  }
};

exports.createJobListing = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
