const crypto = require('crypto');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { findItem } = require('../utils/itemLookup');
const { getRazorpayClient } = require('../config/razorpay');

// POST /api/payments/create-order  { itemType, itemId }
async function createOrder(req, res, next) {
  try {
    const { itemType, itemId } = req.body;
    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId) {
      throw new ApiError(400, 'itemType and itemId are required', 'VALIDATION_ERROR');
    }

    const item = await findItem(itemType, itemId);
    if (!item || !item.isPublished) {
      throw new ApiError(404, 'This item is not available', 'NOT_FOUND');
    }
    if (!item.isPaid) {
      throw new ApiError(400, 'This item is free - use the enrollment endpoint instead', 'NOT_PAID_ITEM');
    }

    const existingEnrollment = await Enrollment.findOne({ student: req.user.id, itemType, itemId });
    if (existingEnrollment) {
      throw new ApiError(409, 'You are already enrolled in this item', 'ALREADY_ENROLLED');
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      throw new ApiError(
        503,
        'Payments are not configured yet. The admin needs to add PAYMENT_KEY_ID and PAYMENT_KEY_SECRET.',
        'PAYMENTS_NOT_CONFIGURED'
      );
    }

    const amountInPaise = Math.round(item.price * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        // Razorpay's `receipt` field has a hard 40-character limit - the old
        // itemType_itemId_studentId_timestamp format could exceed that and
        // caused a 400 error. Full details go in `notes` instead, which has
        // no such limit.
        receipt: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        notes: { itemType, itemId: String(itemId), studentId: req.user.id },
      });
    } catch (razorpayErr) {
      // Surface Razorpay's actual reason (e.g. bad credentials, invalid field)
      // instead of a generic 500 - makes future payment-gateway issues far
      // easier to diagnose from the Render logs / frontend error message.
      const description = razorpayErr?.error?.description || razorpayErr?.message || 'Payment gateway error';
      throw new ApiError(502, `Could not create payment order: ${description}`, 'RAZORPAY_ERROR');
    }

    const order = await Order.create({
      student: req.user.id,
      itemType,
      itemId,
      itemTitle: item.title,
      amount: amountInPaise,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: 'CREATED',
    });

    success(res, {
      order: order.toSafeJSON(),
      razorpayKeyId: process.env.PAYMENT_KEY_ID,
    }, 201);
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, 'Missing payment verification fields', 'VALIDATION_ERROR');
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, student: req.user.id });
    if (!order) {
      throw new ApiError(404, 'Order not found', 'NOT_FOUND');
    }

    // Idempotency: if we've already processed this order as PAID, don't redo it
    if (order.status === 'PAID') {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        itemType: order.itemType,
        itemId: order.itemId,
      });
      return success(res, { message: 'Payment already verified', enrollment });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYMENT_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.status = 'FAILED';
      await order.save();
      throw new ApiError(400, 'Payment verification failed - signature mismatch', 'SIGNATURE_MISMATCH');
    }

    order.status = 'PAID';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Create the enrollment now that payment is confirmed (idempotent via unique index)
    let enrollment = await Enrollment.findOne({
      student: req.user.id,
      itemType: order.itemType,
      itemId: order.itemId,
    });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: req.user.id,
        itemType: order.itemType,
        itemId: order.itemId,
      });
    }

    success(res, { message: 'Payment verified successfully', order: order.toSafeJSON(), enrollment });
  } catch (err) {
    next(err);
  }
}

// POST /api/payments/webhook (Razorpay server-to-server notification, no user auth)
// req.body here is a raw Buffer (see webhook.routes.js) so we can verify the HMAC
// signature against the exact bytes Razorpay sent, then parse it as JSON ourselves.
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PAYMENT_WEBHOOK_SECRET not configured - rejecting webhook');
      return res.status(503).json({ success: false, message: 'Webhook not configured' });
    }

    const rawBody = req.body; // Buffer
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.event === 'payment.captured') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const order = await Order.findOne({ razorpayOrderId });

      if (order && order.status !== 'PAID') {
        order.status = 'PAID';
        order.razorpayPaymentId = event.payload.payment.entity.id;
        await order.save();

        const existing = await Enrollment.findOne({
          student: order.student,
          itemType: order.itemType,
          itemId: order.itemId,
        });
        if (!existing) {
          await Enrollment.create({
            student: order.student,
            itemType: order.itemType,
            itemId: order.itemId,
          });
        }
      }
    }

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      await Order.findOneAndUpdate({ razorpayOrderId, status: 'CREATED' }, { status: 'FAILED' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
}

// GET /api/payments/my
async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ student: req.user.id }).sort({ createdAt: -1 });
    success(res, { orders: orders.map((o) => o.toSafeJSON()) });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment, handleWebhook, myOrders };
