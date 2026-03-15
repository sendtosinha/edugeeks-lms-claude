const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px; margin: 0 auto;
  background: #ffffff; border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;
const headerStyle = `
  background: linear-gradient(135deg, #1E40AF, #F97316);
  padding: 32px 24px; text-align: center;
`;
const bodyStyle = `padding: 32px 24px; color: #374151;`;
const btnStyle = `
  display: inline-block; background: #F97316;
  color: white; padding: 14px 32px; border-radius: 8px;
  text-decoration: none; font-weight: 600; margin: 16px 0;
`;

exports.sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify/${token}`;
  try {
    await transporter.sendMail({
      from: `"EduGeeks" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your EduGeeks account',
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;font-size:28px;">📚 EduGeeks</h1>
          </div>
          <div style="${bodyStyle}">
            <h2>Welcome, ${name}! 🎉</h2>
            <p>You're one step away from accessing top-quality CBSE, JEE, NEET & CUET courses.</p>
            <p>Please verify your email to activate your account:</p>
            <a href="${url}" style="${btnStyle}">Verify Email</a>
            <p style="color:#9CA3AF;font-size:12px;">Link expires in 24 hours. If you didn't register, ignore this email.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    logger.error('Failed to send verification email:', err);
  }
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  try {
    await transporter.sendMail({
      from: `"EduGeeks" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your EduGeeks password',
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;">📚 EduGeeks</h1>
          </div>
          <div style="${bodyStyle}">
            <h2>Password Reset Request</h2>
            <p>Hi ${name}, we received a request to reset your password.</p>
            <a href="${url}" style="${btnStyle}">Reset Password</a>
            <p style="color:#9CA3AF;font-size:12px;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    logger.error('Failed to send password reset email:', err);
  }
};

exports.sendEnrollmentEmail = async (email, name, items) => {
  const courseList = items.map(i => `<li style="padding:6px 0;">✅ ${i.course?.title || 'Course'}</li>`).join('');
  try {
    await transporter.sendMail({
      from: `"EduGeeks" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Enrollment Confirmed — EduGeeks',
      html: `
        <div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;">📚 EduGeeks</h1>
          </div>
          <div style="${bodyStyle}">
            <h2>You're enrolled! 🎓</h2>
            <p>Hi ${name}, your payment was successful. You're now enrolled in:</p>
            <ul style="list-style:none;padding:0;">${courseList}</ul>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="${btnStyle}">Go to Dashboard</a>
            <p>Start learning today and achieve your goals!</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    logger.error('Failed to send enrollment email:', err);
  }
};
