// course.routes.js
const express = require('express');
const router = express.Router();
const course = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', course.getCourses);
router.get('/categories', course.getCategories);
router.get('/:slug', authenticate, course.getCourse);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), course.createCourse);
router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), course.updateCourse);
router.delete('/:id', authenticate, authorize('ADMIN'), course.deleteCourse);
router.post('/:id/review', authenticate, course.addReview);

module.exports = router;
