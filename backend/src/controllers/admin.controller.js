const User = require('../models/User');
const Course = require('../models/Course');
const Training = require('../models/Training');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');

// GET /api/admin/students?search=&status=&page=&limit=
async function listStudents(req, res, next) {
  try {
    const { search = '', status = 'all', page = 1, limit = 10 } = req.query;

    const query = { role: 'STUDENT' };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    success(res, {
      students: students.map((s) => s.toSafeJSON()),
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

async function suspendStudent(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'STUDENT' });
    if (!user) {
      throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    }
    user.isActive = false;
    user.refreshTokenHash = undefined; // force logout everywhere
    await user.save();

    success(res, { message: 'Student suspended', user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function activateStudent(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'STUDENT' });
    if (!user) {
      throw new ApiError(404, 'Student not found', 'NOT_FOUND');
    }
    user.isActive = true;
    await user.save();

    success(res, { message: 'Student activated', user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats
// Full stats (enrollments, courses, payments, revenue etc.) get wired up
// as each of those systems is built in later phases. For now this reports
// what already exists: user counts.
async function getStats(req, res, next) {
  try {
    const [
      totalStudents,
      verifiedStudents,
      activeStudents,
      suspendedStudents,
      totalCourses,
      publishedCourses,
      totalTrainings,
      publishedTrainings,
      totalEnrollments,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', isVerified: true }),
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      User.countDocuments({ role: 'STUDENT', isActive: false }),
      Course.countDocuments({}),
      Course.countDocuments({ isPublished: true }),
      Training.countDocuments({}),
      Training.countDocuments({ isPublished: true }),
      Enrollment.countDocuments({}),
    ]);

    success(res, {
      stats: {
        totalStudents,
        verifiedStudents,
        activeStudents,
        suspendedStudents,
        totalCourses,
        publishedCourses,
        totalTrainings,
        publishedTrainings,
        totalEnrollments,
        // Placeholders until their respective phases are built:
        totalCertificates: 0,
        totalPayments: 0,
        totalRevenue: 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStudents, suspendStudent, activateStudent, getStats };
