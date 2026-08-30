const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { getRazorpayClient } = require('../config/razorpay');
const { logAudit } = require('../utils/auditLog');

// GET /api/admin/payments?status=&page=&limit=
async function listPayments(req, res, next) {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    success(res, {
      orders,
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

// GET /api/admin/payments/revenue
async function getRevenue(req, res, next) {
  try {
    const paidOrders = await Order.find({ status: 'PAID' });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0) / 100; // paise -> rupees
    const totalPayments = paidOrders.length;

    success(res, { totalRevenue, totalPayments });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/payments/:id/refund
async function refundPayment(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
    if (order.status !== 'PAID') {
      throw new ApiError(400, 'Only paid orders can be refunded', 'INVALID_STATE');
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      throw new ApiError(503, 'Payments are not configured', 'PAYMENTS_NOT_CONFIGURED');
    }

    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {});

    order.status = 'REFUNDED';
    order.refundId = refund.id;
    order.refundedAt = new Date();
    await order.save();

    logAudit({
      adminId: req.user.id,
      action: 'REFUND_PAYMENT',
      targetType: 'Order',
      targetId: order._id,
      details: `Refunded ₹${(order.amount / 100).toFixed(2)} for "${order.itemTitle}"`,
    });

    success(res, { message: 'Refund initiated', order: order.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPayments, getRevenue, refundPayment };
