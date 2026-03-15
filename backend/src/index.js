require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const paymentRoutes = require('./routes/payment.routes');
const lectureRoutes = require('./routes/lecture.routes');
const testRoutes = require('./routes/test.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const adminRoutes = require('./routes/admin.routes');
const blogRoutes = require('./routes/blog.routes');
const uploadRoutes = require('./routes/upload.routes');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use(globalLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/lectures', lectureRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/upload', uploadRoutes);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`🚀 EduGeeks API running on port ${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
