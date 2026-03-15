// enrollment.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

router.get('/my-courses', authenticate, async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId, status: 'ACTIVE' },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatar: true } },
            chapters: { include: { lectures: { select: { id: true } } } }
          }
        }
      }
    });
    res.json({ success: true, enrollments });
  } catch (err) { next(err); }
});

module.exports = router;
