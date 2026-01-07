import prisma from '../src/config/prisma.js';
import { validationResult } from 'express-validator';

const postQueryInclude = {
  author: true,
  echoParent: { include: { author: true } },
  comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
  likes: { select: { userId: true } },
  _count: { select: { likes: true, echoes: true } }
};

// GET /feed
export const getFeed = async (req, res, next) => {
  try {
    const me = req.user.id;
    const following = await prisma.follow.findMany({
      where: { followerId: me },
      select: { followingId: true }
    });
    const ids = [me, ...following.map(f => f.followingId)];
    const now = new Date();

    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids }, publishedAt: { lte: now } },
      orderBy: { publishedAt: 'desc' },
      include: postQueryInclude,
      take: 60
    });

    res.json({ posts, me });
  } catch (err) {
    next(err);
  }
};

// POST / (create post)
export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { content, imageUrl, scheduledAt } = req.body;
  try {
    const publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: req.user.id,
        scheduledAt: scheduledAt ? publishedAt : null,
        publishedAt
      }
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// POST /:id/echo (reshare)
export const echoPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { content = '', scheduledAt } = req.body;
  try {
    const parent = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!parent) return res.status(404).json({ message: 'Post not found' });

    const publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
    const echo = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content,
        echoParentId: parent.id,
        publishedAt,
        scheduledAt: scheduledAt ? publishedAt : null
      }
    });
    res.status(201).json(echo);
  } catch (err) {
    next(err);
  }
};

// POST /:id/like
export const likePost = async (req, res, next) => {
  try {
    await prisma.like.upsert({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } },
      create: { userId: req.user.id, postId: req.params.id },
      update: {}
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// DELETE /:id/like
export const unlikePost = async (req, res, next) => {
  try {
    await prisma.like.delete({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } }
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// POST /:id/comments
export const addComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId: req.params.id,
        authorId: req.user.id
      }
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
