import prisma from "../src/config/prisma.js";

// Search posts by content and hashtags
export const searchPosts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ posts: [] });
    }

    const posts = await prisma.post.findMany({
      where: {
        content: { contains: q, mode: "insensitive" },
        deletedAt: null,
      },
      include: {
        author: true,
        echoParent: { include: { author: true } },
        comments: { take: 3, include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// Search users
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
      take: 20,
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Get trending hashtags
export const getTrendingHashtags = async (req, res, next) => {
  try {
    const hashtags = await prisma.hashtag.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { posts: { _count: "desc" } },
      take: 10,
    });

    res.json({ hashtags: hashtags.map(h => ({ ...h, count: h._count.posts })) });
  } catch (err) {
    next(err);
  }
};

// Get posts by hashtag
export const getPostsByHashtag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const posts = await prisma.post.findMany({
      where: {
        hashtags: { some: { hashtag: { tag: { equals: tag, mode: "insensitive" } } } },
        deletedAt: null,
      },
      include: {
        author: true,
        echoParent: { include: { author: true } },
        comments: { take: 3, include: { author: true }, orderBy: { createdAt: "asc" } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, echoes: true, comments: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
};
