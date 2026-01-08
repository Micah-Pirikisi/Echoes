import prisma from "../src/config/prisma.js";
import { validationResult } from "express-validator";

const postQueryInclude = {
  author: true,
  echoParent: { include: { author: true } },
  comments: {
    include: { author: true },
    orderBy: { createdAt: "asc" },
    take: 3,
  },
  likes: { select: { userId: true } },
  _count: { select: { likes: true, echoes: true, comments: true } },
};

// GET /feed
export const getFeed = async (req, res, next) => {
  try {
    const me = req.user.id;
    const skip = parseInt(req.query.skip) || 0;
    const take = parseInt(req.query.take) || 20;

    const following = await prisma.follow.findMany({
      where: { followerId: me },
      select: { followingId: true },
    });
    const ids = [me, ...following.map((f) => f.followingId)];
    const now = new Date();

    const posts = await prisma.post.findMany({
      where: { authorId: { in: ids }, publishedAt: { lte: now }, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      include: postQueryInclude,
      skip,
      take,
    });

    res.json({ posts, me });
  } catch (err) {
    next(err);
  }
};

// GET /:id (get single post with all comments)
export const getPost = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: true,
        echoParent: { include: { author: true } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, echoes: true, comments: true } },
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post, me: req.user.id });
  } catch (err) {
    next(err);
  }
};

// POST / (create post)
export const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { content, imageUrl, scheduledAt } = req.body;

  // Ensure either content or imageUrl is provided
  if (!content && !imageUrl) {
    return res
      .status(400)
      .json({ error: "Post must have content or an image" });
  }

  try {
    const publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
    const post = await prisma.post.create({
      data: {
        content: content || null,
        imageUrl: imageUrl || null,
        authorId: req.user.id,
        scheduledAt: scheduledAt ? publishedAt : null,
        publishedAt,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// POST /:id/echo (reshare)
export const echoPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { content = "", scheduledAt } = req.body;
  try {
    const parent = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!parent) return res.status(404).json({ message: "Post not found" });

    const publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
    const echo = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content,
        echoParentId: parent.id,
        publishedAt,
        scheduledAt: scheduledAt ? publishedAt : null,
      },
    });
    res.status(201).json(echo);
  } catch (err) {
    next(err);
  }
};

// POST /:id/like
export const likePost = async (req, res, next) => {
  try {
    // Check if post exists first
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });

    await prisma.like.upsert({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } },
      create: { userId: req.user.id, postId: req.params.id },
      update: {},
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("Like error:", err);
    next(err);
  }
};

// DELETE /:id/like
export const unlikePost = async (req, res, next) => {
  try {
    const result = await prisma.like.delete({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } },
    }).catch(() => null); // If like doesn't exist, that's fine
    res.json({ ok: true });
  } catch (err) {
    console.error("Unlike error:", err);
    next(err);
  }
};
  } catch (err) {
    next(err);
  }
};

// POST /:id/comments
export const addComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

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
// DELETE /:id (soft delete post)
export const deletePost = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    await prisma.post.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// PATCH /:id (edit post content only)
export const editPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });

    const { content } = req.body;
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { content },
      include: {
        author: true,
        echoParent: { include: { author: true } },
        comments: { take: 3, include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, echoes: true, comments: true } },
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /:id/bookmark (save post)
export const toggleBookmark = async (req, res, next) => {
  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: req.user.id, postId: req.params.id } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_postId: { userId: req.user.id, postId: req.params.id } },
      });
    } else {
      await prisma.bookmark.create({
        data: { userId: req.user.id, postId: req.params.id },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// GET /bookmarks (get user's bookmarks)
export const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        post: {
          include: {
            author: true,
            echoParent: { include: { author: true } },
            comments: { take: 3, include: { author: true }, orderBy: { createdAt: "asc" } },
            likes: { select: { userId: true } },
            _count: { select: { likes: true, echoes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const posts = bookmarks.map((b) => b.post);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// POST /:id/reply (create reply to a post)
export const replyToPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { content, imageUrl, scheduledAt } = req.body;
  try {
    if (!content && !imageUrl) {
      return res.status(400).json({ error: "Reply must have content or an image" });
    }

    const parentPost = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!parentPost) return res.status(404).json({ error: "Post not found" });

    const publishedAt = scheduledAt ? new Date(scheduledAt) : new Date();
    const reply = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content: content || null,
        imageUrl: imageUrl || null,
        replyToId: req.params.id,
        publishedAt,
        scheduledAt: scheduledAt ? publishedAt : null,
      },
      include: {
        author: true,
        replyTo: { include: { author: true } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, echoes: true, comments: true } },
      },
    });
    res.status(201).json(reply);
  } catch (err) {
    next(err);
  }
};

// GET /:id/replies (get all replies to a post)
export const getPostReplies = async (req, res, next) => {
  try {
    const replies = await prisma.post.findMany({
      where: { replyToId: req.params.id, deletedAt: null },
      include: {
        author: true,
        comments: { take: 3, include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, echoes: true, comments: true } },
      },
      orderBy: { publishedAt: "desc" },
    });
    res.json({ replies });
  } catch (err) {
    next(err);
  }
};