const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/appError');
const { sendEnrollmentEmail } = require('../services/email.service');

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ─── Create Order ─────────────────────────────────────────────────────────────
exports.createOrder = async (req, res, next) => {
  try {
    const { courseIds } = req.body;
    const userId = req.user.userId;

    if (!courseIds || !courseIds.length) throw new AppError('No courses specified', 400);

    // Get courses
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds }, isPublished: true },
      select: { id: true, title: true, price: true, discountPrice: true }
    });

    if (courses.length !== courseIds.length) throw new AppError('One or more courses not found', 404);

    // Check if already enrolled
    for (const course of courses) {
      const enrolled = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } }
      });
      if (enrolled) throw new AppError(`Already enrolled in ${course.title}`, 409);
    }

    const amount = courses.reduce((sum, c) =>
      sum + (c.discountPrice || c.price), 0
    );
    const amountInPaise = Math.round(amount * 100);

    const receipt = `order_${userId.slice(-6)}_${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        userId,
        courseIds: courseIds.join(',')
      }
    });

    // Save order to DB
    const order = await prisma.order.create({
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount,
        receipt,
        status: 'PENDING',
        userId,
        items: {
          create: courses.map(c => ({
            price: c.discountPrice || c.price,
            courseId: c.id
          }))
        }
      },
      include: { items: { include: { course: true } } }
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (err) { next(err); }
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      throw new AppError('Payment verification failed', 400);
    }

    // Find & update order
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true, user: true }
    });

    if (!order) throw new AppError('Order not found', 404);

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CAPTURED', paymentId: razorpay_payment_id }
    });

    // Create enrollments
    const enrollments = await Promise.all(
      order.items.map(item =>
        prisma.enrollment.create({
          data: {
            userId: order.userId,
            courseId: item.courseId,
            orderId: order.id,
            status: 'ACTIVE'
          }
        })
      )
    );

    // Send confirmation email
    await sendEnrollmentEmail(order.user.email, order.user.name, order.items);

    res.json({
      success: true,
      message: 'Payment verified and enrollment created',
      enrollments
    });
  } catch (err) { next(err); }
};

// ─── Webhook Handler ──────────────────────────────────────────────────────────
exports.webhook = async (req, res, next) => {
  try {
    const sig = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (sig !== expectedSig) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.failed') {
      const orderId = payload.payment.entity.order_id;
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' }
      });
    }

    res.json({ received: true });
  } catch (err) { next(err); }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: {
        items: {
          include: {
            course: { select: { id: true, title: true, thumbnail: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};
