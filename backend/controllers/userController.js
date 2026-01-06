import { prisma } from "../config/prisma.js";

export const listUsers = async (req, res, next) => {
  try {
    const me = req.user.id;

    const [users, following, pending] = await Promise.all([
      prisma.user.findMany({
        where: { id: { not: me } },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          bio: true,
        },
      }),
      prisma.follow.findMany({
        where: { followerId: me },
        select: { followingId: true },
      }),
      prisma.followRequest.findMany({
        where: { requesterId: me, status: "PENDING" },
        select: { targetId: true },
      }),
    ]);

    const followingSet = new Set(following.map((f) => f.followingId));
    const pendingSet = new Set(pending.map((p) => p.targetId));

    res.json({
      users,
      following: [...followingSet],
      pending: [...pendingSet],
    });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        posts: {
          orderBy: { createdAt: "desc" },
          include: {
            comments: { include: { author: true } },
            likes: { select: { userId: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const sendFollowRequest = async (req, res, next) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const followRequest = await prisma.followRequest.upsert({
      where: {
        requesterId_targetId: {
          requesterId: req.user.id,
          targetId,
        },
      },
      create: {
        requesterId: req.user.id,
        targetId,
        status: "PENDING",
      },
      update: { status: "PENDING" },
    });

    res.json(followRequest);
  } catch (err) {
    next(err);
  }
};

export const acceptFollowRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const followRequest = await prisma.followRequest.findUnique({
      where: { id: requestId },
    });

    if (!followRequest || followRequest.targetId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    await prisma.$transaction([
      prisma.followRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.follow.create({
        data: {
          followerId: followRequest.requesterId,
          followingId: followRequest.targetId,
        },
      }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const rejectFollowRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    const followRequest = await prisma.followRequest.findUnique({
      where: { id: requestId },
    });

    if (!followRequest || followRequest.targetId !== req.user.id) {
      return res.status(404).json({ message: "Not found" });
    }

    await prisma.followRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
