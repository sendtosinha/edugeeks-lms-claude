// ─── auth.routes.js ───────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validate.middleware');

router.post('/register', validateRegister, auth.register);
router.post('/login', validateLogin, auth.login);
router.post('/google', auth.googleAuth);
router.get('/me', authenticate, auth.getMe);
router.post('/logout', auth.logout);
router.get('/verify/:token', auth.verifyEmail);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
