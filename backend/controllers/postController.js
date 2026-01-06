import { prisma } from "../config/prisma.js";
import { validationResult } from "express-validator";

export const getFeed = async (req, res, next) => {
  try {
    const me = req.user.id;

    const following = await prisma.follow.findMany({
      where: { followerId: me },
      select: { followingId: true },
    });

    const ids = [me, ...following.map((f) => f.followingId)];

    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids } },
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
      },
      take: 50,
    });

    res.json({ posts, me });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content, imageUrl } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: req.user.id,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req, res, next) => {
  try {
    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: req.params.id,
        },
      },
      create: {
        userId: req.user.id,
        postId: req.params.id,
      },
      update: {},
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: req.params.id,
        },
      },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId: req.params.id,
        authorId: req.user.id,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
