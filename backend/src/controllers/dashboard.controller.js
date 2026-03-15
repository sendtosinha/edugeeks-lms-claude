const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// ─── Student Dashboard ────────────────────────────────────────────────────────
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [enrollments, recentProgress, testAttempts, user] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId, status: 'ACTIVE' },
        include: {
          course: {
            include: {
              chapters: {
                include: { lectures: { select: { id: true } } }
              },
              instructor: { select: { name: true, avatar: true } }
            }
          }
        }
      }),
      prisma.lectureProgress.findMany({
        where: { userId },
        include: {
          lecture: {
            include: {
              chapter: {
                include: { course: { select: { id: true, title: true, thumbnail: true, slug: true } } }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.testAttempt.findMany({
        where: { userId, submittedAt: { not: null } },
        include: { test: { select: { title: true, totalMarks: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 5
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, grade: true, avatar: true, createdAt: true }
      })
    ]);

    // Calculate progress per course
    const coursesWithProgress = await Promise.all(enrollments.map(async (enrollment) => {
      const totalLectures = enrollment.course.chapters.reduce(
        (sum, ch) => sum + ch.lectures.length, 0
      );
      const completedLectures = await prisma.lectureProgress.count({
        where: {
          userId,
          isCompleted: true,
          lecture: { chapter: { courseId: enrollment.course.id } }
        }
      });

      return {
        ...enrollment,
        progressPercent: totalLectures > 0
          ? Math.round((completedLectures / totalLectures) * 100)
          : 0,
        completedLectures,
        totalLectures
      };
    }));

    // Stats
    const stats = {
      totalCourses: enrollments.length,
      totalTests: testAttempts.length,
      avgScore: testAttempts.length
        ? Math.round(testAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / testAttempts.length)
        : 0,
      totalHours: Math.round(
        (await prisma.lectureProgress.aggregate({
          where: { userId },
          _sum: { watchedTime: true }
        }))._sum.watchedTime / 3600 || 0
      )
    };

    res.json({
      success: true,
      user,
      stats,
      enrollments: coursesWithProgress,
      recentProgress,
      recentTests: testAttempts
    });
  } catch (err) { next(err); }
};

// ─── Update Lecture Progress ──────────────────────────────────────────────────
exports.updateProgress = async (req, res, next) => {
  try {
    const { lectureId } = req.params;
    const { watchedTime, isCompleted } = req.body;
    const userId = req.user.userId;

    // Verify enrollment
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: { chapter: { select: { courseId: true } } }
    });
    if (!lecture) throw new AppError('Lecture not found', 404);

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lecture.chapter.courseId } }
    });
    if (!enrollment && !lecture.isFree) throw new AppError('Not enrolled', 403);

    const progress = await prisma.lectureProgress.upsert({
      where: { userId_lectureId: { userId, lectureId } },
      create: { userId, lectureId, watchedTime: watchedTime || 0, isCompleted: isCompleted || false },
      update: {
        watchedTime: { set: Math.max(watchedTime || 0) },
        isCompleted: isCompleted !== undefined ? isCompleted : undefined
      }
    });

    res.json({ success: true, progress });
  } catch (err) { next(err); }
};

// ─── Get My Notes ─────────────────────────────────────────────────────────────
exports.getMyNotes = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const where = { userId: req.user.userId };
    if (courseId) where.courseId = courseId;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, notes });
  } catch (err) { next(err); }
};

// ─── Save Note ────────────────────────────────────────────────────────────────
exports.saveNote = async (req, res, next) => {
  try {
    const { title, content, lectureId, courseId } = req.body;
    const note = await prisma.note.create({
      data: { userId: req.user.userId, title, content, lectureId, courseId }
    });
    res.status(201).json({ success: true, note });
  } catch (err) { next(err); }
};
