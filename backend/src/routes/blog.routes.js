const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { AppError } = require('../utils/appError');

const prisma = new PrismaClient();

// Get all posts
router.get('/', async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const where = { isPublished: true };
    if (category) where.category = category;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: { select: { name: true, avatar: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit)
      }),
      prisma.blogPost.count({ where })
    ]);
    res.json({ success: true, posts, total });
  } catch (err) { next(err); }
});

// Get single post by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug, isPublished: true },
      include: { author: { select: { name: true, avatar: true } } }
    });
    if (!post) throw new AppError('Post not found', 404);
    res.json({ success: true, post });
  } catch (err) { next(err); }
});

// Create post (admin/teacher)
router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { title, content, excerpt, thumbnail, category, tags, isPublished, metaTitle, metaDescription } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-') + '-' + Date.now();

    const post = await prisma.blogPost.create({
      data: {
        title, slug, content, excerpt, thumbnail, category,
        tags: tags || [],
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        metaTitle, metaDescription,
        authorId: req.user.userId
      }
    });
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
});

module.exports = router;
