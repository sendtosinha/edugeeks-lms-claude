const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// ─── Admin Overview Stats ─────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [
      totalStudents, totalCourses, totalRevenue,
      recentOrders, enrollmentsByDay, topCourses
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.order.aggregate({
        where: { status: 'CAPTURED' },
        _sum: { amount: true }
      }),
      prisma.order.findMany({
        where: { status: 'CAPTURED' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { course: { select: { title: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      // Last 30 days enrollment count by day
      prisma.$queryRaw`
        SELECT DATE(enrolled_at) as date, COUNT(*) as count
        FROM "Enrollment"
        WHERE enrolled_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(enrolled_at)
        ORDER BY date ASC
      `,
      prisma.course.findMany({
        where: { isPublished: true },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5,
        select: {
          id: true, title: true, thumbnail: true, price: true,
          _count: true
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentOrders,
        enrollmentsByDay,
        topCourses
      }
    });
  } catch (err) { next(err); }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, grade: true,
          avatar: true, isVerified: true, createdAt: true,
          _count: { select: { enrollments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};

// ─── Toggle Course Publish ────────────────────────────────────────────────────
exports.toggleCoursePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Course not found', 404);

    const updated = await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished }
    });

    res.json({ success: true, course: updated });
  } catch (err) { next(err); }
};

// ─── Get All Enrollments ──────────────────────────────────────────────────────
exports.getEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, courseId } = req.query;
    const where = {};
    if (courseId) where.courseId = courseId;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } }
        },
        orderBy: { enrolledAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.enrollment.count({ where })
    ]);

    res.json({ success: true, enrollments, total });
  } catch (err) { next(err); }
};

// ─── Get Revenue Analytics ────────────────────────────────────────────────────
exports.getRevenue = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const revenue = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as orders
      FROM "Order"
      WHERE status = 'CAPTURED' 
        AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    res.json({ success: true, revenue });
  } catch (err) { next(err); }
};
