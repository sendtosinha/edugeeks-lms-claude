const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', admin.getStats);
router.get('/users', admin.getUsers);
router.get('/enrollments', admin.getEnrollments);
router.get('/revenue', admin.getRevenue);
router.patch('/courses/:id/toggle-publish', admin.toggleCoursePublish);

module.exports = router;
