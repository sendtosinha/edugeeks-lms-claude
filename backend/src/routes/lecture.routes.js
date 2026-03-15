const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// Get lecture (enrolled students only, or free)
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: req.params.id, isPublished: true },
      include: {
        chapter: {
          include: {
            course: { select: { id: true, title: true, slug: true } },
            lectures: {
              where: { isPublished: true },
              select: { id: true, title: true, position: true, videoDuration: true, isFree: true },
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });
    if (!lecture) throw new AppError('Lecture not found', 404);

    if (!lecture.isFree) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.userId, courseId: lecture.chapter.course.id } }
      });
      if (!enrollment) throw new AppError('Not enrolled in this course', 403);
    }

    // Get user progress for this lecture
    const progress = await prisma.lectureProgress.findUnique({
      where: { userId_lectureId: { userId: req.user.userId, lectureId: lecture.id } }
    });

    res.json({ success: true, lecture, progress });
  } catch (err) { next(err); }
});

// Create chapter
router.post('/chapters', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { title, courseId, position, isFree } = req.body;
    const chapter = await prisma.chapter.create({
      data: { title, courseId, position, isFree: isFree || false, isPublished: true }
    });
    res.status(201).json({ success: true, chapter });
  } catch (err) { next(err); }
});

// Create lecture
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { title, description, position, videoUrl, videoProvider, videoDuration, notesUrl, chapterId, isFree } = req.body;
    const lecture = await prisma.lecture.create({
      data: {
        title, description, position, videoUrl, videoProvider,
        videoDuration, notesUrl, chapterId,
        isFree: isFree || false, isPublished: true
      }
    });

    // Update course lecture count
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    await prisma.course.update({
      where: { id: chapter.courseId },
      data: { totalLectures: { increment: 1 } }
    });

    res.status(201).json({ success: true, lecture });
  } catch (err) { next(err); }
});

// Update lecture
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const lecture = await prisma.lecture.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, lecture });
  } catch (err) { next(err); }
});

module.exports = router;
