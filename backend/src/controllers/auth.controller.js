const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Token Helpers ────────────────────────────────────────────────────────────
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, grade } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('Email already registered', 409);

    const hashed = await bcrypt.hash(password, 12);
    const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const user = await prisma.user.create({
      data: { name, email, password: hashed, grade, verifyToken },
      select: { id: true, name: true, email: true, role: true, grade: true, avatar: true }
    });

    await sendVerificationEmail(email, name, verifyToken);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user,
      accessToken
    });
  } catch (err) { next(err); }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    const { password: _, ...userWithoutPass } = user;
    res.json({
      success: true,
      user: userWithoutPass,
      accessToken
    });
  } catch (err) { next(err); }
};

// ─── Google OAuth ────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, email, googleId, avatar: picture, isVerified: true }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: picture, isVerified: true }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    const { password: _, ...userWithoutPass } = user;
    res.json({ success: true, user: userWithoutPass, accessToken });
  } catch (err) { next(err); }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, role: true,
        grade: true, avatar: true, phone: true, isVerified: true
      }
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true, verifyToken: null }
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) { next(err); }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetTokenExp = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp }
    });

    await sendPasswordResetEmail(email, user.name, resetToken);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        resetToken: token,
        resetTokenExp: { gt: new Date() }
      }
    });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null }
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
};
