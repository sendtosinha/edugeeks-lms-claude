const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// ─── Get All Courses (Public) ─────────────────────────────────────────────────
exports.getCourses = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, grade, subject, category,
      search, sort = 'createdAt', order = 'desc', featured
    } = req.query;

    const where = { isPublished: true };
    if (grade) where.grade = grade;
    if (subject) where.subject = { contains: subject, mode: 'insensitive' };
    if (category) where.category = { slug: category };
    if (featured) where.isFeatured = true;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true, reviews: true } },
          reviews: { select: { rating: true } }
        },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.course.count({ where })
    ]);

    const coursesWithRating = courses.map(c => ({
      ...c,
      avgRating: c.reviews.length
        ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)
        : null,
      reviews: undefined
    }));

    res.json({
      success: true,
      courses: coursesWithRating,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (err) { next(err); }
};

// ─── Get Single Course ────────────────────────────────────────────────────────
exports.getCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;

    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true } },
        chapters: {
          where: { isPublished: true },
          include: {
            lectures: {
              where: { isPublished: true },
              select: {
                id: true, title: true, position: true,
                videoDuration: true, isFree: true,
                videoUrl: true, notesUrl: true
              },
              orderBy: { position: 'asc' }
            }
          },
          orderBy: { position: 'asc' }
        },
        reviews: {
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { enrollments: true, reviews: true } }
      }
    });

    if (!course) throw new AppError('Course not found', 404);

    // Check if user is enrolled
    let isEnrolled = false;
    let userProgress = null;
    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: course.id } }
      });
      isEnrolled = !!enrollment;

      if (isEnrolled) {
        const progress = await prisma.lectureProgress.findMany({
          where: { userId, lecture: { chapter: { courseId: course.id } } },
          select: { lectureId: true, isCompleted: true, watchedTime: true }
        });
        userProgress = progress;
      }
    }

    // Hide video URLs if not enrolled (except free lectures)
    if (!isEnrolled) {
      course.chapters = course.chapters.map(ch => ({
        ...ch,
        lectures: ch.lectures.map(lec => ({
          ...lec,
          videoUrl: lec.isFree ? lec.videoUrl : null,
          notesUrl: lec.isFree ? lec.notesUrl : null
        }))
      }));
    }

    const avgRating = course.reviews.length
      ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
      : null;

    res.json({ success: true, course: { ...course, avgRating, isEnrolled, userProgress } });
  } catch (err) { next(err); }
};

// ─── Create Course (Admin/Teacher) ───────────────────────────────────────────
exports.createCourse = async (req, res, next) => {
  try {
    const {
      title, description, shortDesc, thumbnail, previewVideo,
      price, discountPrice, grade, examCategory, subject,
      language, categoryId, metaTitle, metaDescription
    } = req.body;

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();

    const course = await prisma.course.create({
      data: {
        title, slug, description, shortDesc, thumbnail, previewVideo,
        price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : null,
        grade, examCategory: examCategory || [], subject,
        language: language || 'Hindi/English',
        categoryId, metaTitle, metaDescription,
        instructorId: req.user.userId
      }
    });

    res.status(201).json({ success: true, course });
  } catch (err) { next(err); }
};

// ─── Update Course ────────────────────────────────────────────────────────────
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Course not found', 404);

    if (req.user.role !== 'ADMIN' && course.instructorId !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...updates,
        price: updates.price ? Number(updates.price) : undefined,
        discountPrice: updates.discountPrice ? Number(updates.discountPrice) : undefined
      }
    });

    res.json({ success: true, course: updated });
  } catch (err) { next(err); }
};

// ─── Delete Course ────────────────────────────────────────────────────────────
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN') throw new AppError('Admin only', 403);

    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) { next(err); }
};

// ─── Get Categories ───────────────────────────────────────────────────────────
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { courses: true } } }
    });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

// ─── Add Review ───────────────────────────────────────────────────────────────
exports.addReview = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (!enrollment) throw new AppError('You must be enrolled to review', 403);

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating: Number(rating), comment },
      update: { rating: Number(rating), comment }
    });

    res.json({ success: true, review });
  } catch (err) { next(err); }
};
