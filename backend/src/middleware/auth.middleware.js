// auth.middleware.js
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError');

exports.authenticate = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) throw new AppError('Authentication required', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    if (err.name === 'TokenExpiredError') return next(new AppError('Token expired', 401));
    next(err);
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }
  next();
};

exports.optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (_) { /* ignore */ }
  next();
};
