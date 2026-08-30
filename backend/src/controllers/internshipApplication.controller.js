const InternshipApplication = require('../models/InternshipApplication');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { isValidEmail } = require('../utils/validation');

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'courseOrDegree',
  'college',
  'tenthPercentage',
  'twelfthPercentage',
  'internshipType',
];

// POST /api/internship-applications  (multipart/form-data, field "resume")
async function submitApplication(req, res, next) {
  try {
    const missing = REQUIRED_FIELDS.filter((f) => !req.body[f] || !req.body[f].trim());
    if (missing.length > 0) {
      throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`, 'VALIDATION_ERROR');
    }
    if (!isValidEmail(req.body.email)) {
      throw new ApiError(400, 'Please provide a valid email address', 'VALIDATION_ERROR');
    }
    if (!req.file) {
      throw new ApiError(400, 'Resume file is required', 'VALIDATION_ERROR');
    }

    const application = await InternshipApplication.create({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      courseOrDegree: req.body.courseOrDegree,
      college: req.body.college,
      tenthPercentage: req.body.tenthPercentage,
      twelfthPercentage: req.body.twelfthPercentage,
      internshipType: req.body.internshipType,
      resumeFileName: req.file.originalname,
      resumeContentType: req.file.mimetype,
      resumeData: req.file.buffer,
    });

    success(res, { message: 'Application submitted successfully!', applicationId: application._id }, 201);
  } catch (err) {
    next(err);
  }
}

// ---------- Admin ----------

// GET /api/admin/internship-applications?search=&internshipType=&status=&page=&limit=
async function listApplications(req, res, next) {
  try {
    const { search = '', internshipType, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { college: regex }];
    }
    if (internshipType) query.internshipType = internshipType;
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      InternshipApplication.find(query)
        .select('-resumeData')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      InternshipApplication.countDocuments(query),
    ]);

    success(res, {
      applications: applications.map((a) => a.toSafeJSON()),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/internship-applications/:id/resume
async function downloadResume(req, res, next) {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) throw new ApiError(404, 'Application not found', 'NOT_FOUND');

    res.setHeader('Content-Type', application.resumeContentType);
    res.setHeader('Content-Disposition', `attachment; filename="${application.resumeFileName}"`);
    res.send(application.resumeData);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/internship-applications/:id/status  { status }
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['NEW', 'REVIEWED', 'SHORTLISTED', 'REJECTED'].includes(status)) {
      throw new ApiError(400, 'Invalid status', 'VALIDATION_ERROR');
    }

    const application = await InternshipApplication.findById(req.params.id);
    if (!application) throw new ApiError(404, 'Application not found', 'NOT_FOUND');

    application.status = status;
    await application.save();

    success(res, { application: application.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitApplication, listApplications, downloadResume, updateStatus };
