const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|webm/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Invalid file type'));
  }
});

const uploadToS3 = (buffer, key, contentType) => {
  return s3.upload({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private'
  }).promise();
};

// Upload thumbnail/image
router.post('/image', authenticate, authorize('ADMIN', 'TEACHER'),
  upload.single('image'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided' });
      const key = `images/${Date.now()}-${req.file.originalname}`;
      const result = await uploadToS3(req.file.buffer, key, req.file.mimetype);
      // Generate signed URL for private access
      const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Expires: 3600 * 24 * 7 // 7 days
      });
      res.json({ success: true, url: result.Location, key });
    } catch (err) { next(err); }
  }
);

// Upload PDF notes
router.post('/notes', authenticate, authorize('ADMIN', 'TEACHER'),
  upload.single('notes'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided' });
      const key = `notes/${Date.now()}-${req.file.originalname}`;
      const result = await uploadToS3(req.file.buffer, key, 'application/pdf');
      res.json({ success: true, url: result.Location, key });
    } catch (err) { next(err); }
  }
);

// Upload video (for smaller videos; large ones use presigned URL)
router.post('/video', authenticate, authorize('ADMIN', 'TEACHER'),
  upload.single('video'), async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided' });
      const key = `videos/${Date.now()}-${req.file.originalname}`;
      const result = await uploadToS3(req.file.buffer, key, req.file.mimetype);
      res.json({ success: true, url: result.Location, key });
    } catch (err) { next(err); }
  }
);

// Get presigned upload URL for large videos
router.post('/presigned', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { filename, contentType } = req.body;
    const key = `videos/${Date.now()}-${filename}`;
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: 3600 // 1 hour to upload
    });
    res.json({ success: true, uploadUrl, key });
  } catch (err) { next(err); }
});

// Get signed download URL for notes
router.post('/download-url', authenticate, async (req, res, next) => {
  try {
    const { key } = req.body;
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: 3600 // 1 hour
    });
    res.json({ success: true, url });
  } catch (err) { next(err); }
});

module.exports = router;
