// test.routes.js
const express = require('express');
const router = express.Router();
const test = require('../controllers/test.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/course/:courseId', authenticate, test.getCourseTests);
router.post('/start/:testId', authenticate, test.startTest);
router.post('/submit/:attemptId', authenticate, test.submitTest);
router.get('/result/:attemptId', authenticate, test.getTestResult);
router.get('/history', authenticate, test.getMyTestHistory);
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), test.createTest);

module.exports = router;
