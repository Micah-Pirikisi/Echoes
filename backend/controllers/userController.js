import { prisma } from "../config/prisma.js";
import { validationResult } from "express-validator";

export const getAllUsers = async (req, res, next) => {
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
    res.json({ users, following: [...followingSet], pending: [...pendingSet] });
  } catch (err) {
    next(err);
  }
};

export const getIncomingFollowRequests = async (req, res, next) => {
  try {
    const me = req.user.id;
    const requests = await prisma.followRequest.findMany({
      where: { targetId: me, status: "PENDING" },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
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
          orderBy: { publishedAt: "desc" },
          include: {
            comments: { include: { author: true } },
            likes: { select: { userId: true } },
            echoParent: { include: { author: true } },
            _count: { select: { likes: true, echoes: true } },
          },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createFollowRequest = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id)
      return res.status(400).json({ message: "Cannot follow yourself" });
    const fr = await prisma.followRequest.upsert({
      where: { requesterId_targetId: { requesterId: req.user.id, targetId } },
      create: { requesterId: req.user.id, targetId, status: "PENDING" },
      update: { status: "PENDING" },
    });
    res.json(fr);
  } catch (err) {
    next(err);
  }
};

export const acceptFollowRequest = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const fr = await prisma.followRequest.findUnique({ where: { id: reqId } });
    if (!fr || fr.targetId !== req.user.id)
      return res.status(404).json({ message: "Not found" });
    await prisma.$transaction([
      prisma.followRequest.update({
        where: { id: reqId },
        data: { status: "ACCEPTED" },
      }),
      prisma.follow.create({
        data: { followerId: fr.requesterId, followingId: fr.targetId },
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const rejectFollowRequest = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const fr = await prisma.followRequest.findUnique({ where: { id: reqId } });
    if (!fr || fr.targetId !== req.user.id)
      return res.status(404).json({ message: "Not found" });
    await prisma.followRequest.update({
      where: { id: reqId },
      data: { status: "REJECTED" },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: req.body.avatarUrl },
    });
    res.json({ avatarUrl: updated.avatarUrl });
  } catch (err) {
    next(err);
  }
};
