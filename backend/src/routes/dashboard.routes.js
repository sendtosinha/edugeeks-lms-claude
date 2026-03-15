// dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, dashboard.getStudentDashboard);
router.patch('/progress/:lectureId', authenticate, dashboard.updateProgress);
router.get('/notes', authenticate, dashboard.getMyNotes);
router.post('/notes', authenticate, dashboard.saveNote);

module.exports = router;
