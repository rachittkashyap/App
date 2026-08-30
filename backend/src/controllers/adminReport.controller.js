const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const EmailJob = require('../models/EmailJob');
const Course = require('../models/Course');
const Training = require('../models/Training');
const { success } = require('../utils/response');

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Builds the last N months (oldest -> newest) as {key: 'YYYY-M', label: 'Mon YYYY'}
function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return months;
}

function bucketByMonth(docs, dateField, months) {
  const counts = Object.fromEntries(months.map((m) => [m.key, 0]));
  docs.forEach((doc) => {
    const d = new Date(doc[dateField]);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in counts) counts[key] += 1;
  });
  return months.map((m) => ({ label: m.label, count: counts[m.key] }));
}

// GET /api/admin/reports/overview
async function getOverview(req, res, next) {
  try {
    const months = lastNMonths(6);
    const earliestDate = new Date();
    earliestDate.setMonth(earliestDate.getMonth() - 5);
    earliestDate.setDate(1);
    earliestDate.setHours(0, 0, 0, 0);

    const [paidOrders, enrollments, certificates, emailJobs, courses, trainings] = await Promise.all([
      Order.find({ status: 'PAID', createdAt: { $gte: earliestDate } }),
      Enrollment.find({ createdAt: { $gte: earliestDate } }),
      Certificate.find({ status: 'ISSUED', issuedAt: { $gte: earliestDate } }),
      EmailJob.find({}),
      Course.find({}),
      Training.find({}),
    ]);

    // Revenue by month
    const revenueByMonthCounts = Object.fromEntries(months.map((m) => [m.key, 0]));
    paidOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in revenueByMonthCounts) revenueByMonthCounts[key] += order.amount / 100;
    });
    const revenueByMonth = months.map((m) => ({ label: m.label, revenue: Math.round(revenueByMonthCounts[m.key]) }));

    // Enrollments by month
    const enrollmentsByMonth = bucketByMonth(enrollments, 'createdAt', months);

    // Certificates by month
    const certificatesByMonth = bucketByMonth(certificates, 'issuedAt', months);

    // Popularity - top 5 courses/trainings by enrollment count (all-time, not just last 6mo)
    const allEnrollments = await Enrollment.find({});
    const countsByItem = {};
    allEnrollments.forEach((e) => {
      const key = `${e.itemType}:${e.itemId}`;
      countsByItem[key] = (countsByItem[key] || 0) + 1;
    });
    const itemLookup = {};
    courses.forEach((c) => (itemLookup[`COURSE:${c._id}`] = c.title));
    trainings.forEach((t) => (itemLookup[`TRAINING:${t._id}`] = t.title));

    const popularity = Object.entries(countsByItem)
      .map(([key, count]) => ({
        title: itemLookup[key] || 'Deleted item',
        itemType: key.split(':')[0],
        enrollments: count,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Completion rate (all-time)
    const totalEnrollments = allEnrollments.length;
    const completedEnrollments = allEnrollments.filter((e) => e.isCompleted).length;
    const completionRatePercent =
      totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100);

    // Email success/failure (all-time)
    const emailStats = {
      sent: emailJobs.filter((j) => j.status === 'SENT').length,
      failed: emailJobs.filter((j) => j.status === 'FAILED').length,
      pending: emailJobs.filter((j) => j.status === 'PENDING' || j.status === 'PROCESSING').length,
    };

    success(res, {
      revenueByMonth,
      enrollmentsByMonth,
      certificatesByMonth,
      popularity,
      completionRatePercent,
      totalEnrollments,
      completedEnrollments,
      emailStats,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview };
