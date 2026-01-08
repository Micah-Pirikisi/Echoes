// src/routes/postRoutes.js
import { Router } from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import { body } from "express-validator";
import {
  getFeed,
  createPost,
  echoPost,
  likePost,
  unlikePost,
  addComment,
} from "../controllers/postController.js";

const router = Router();

// Feed
router.get("/feed", ensureAuthenticated, getFeed);

// Create post
router.post(
  "/",
  ensureAuthenticated,
  [body("content").optional().isLength({ min: 0, max: 5000 }).trim()],
  createPost
);

// Echo / reshare
router.post(
  "/:id/echo",
  ensureAuthenticated,
  [
    body("content").optional().isLength({ max: 5000 }).trim(),
    body("scheduledAt").optional().isISO8601(),
  ],
  echoPost
);

// Like / unlike
router.post("/:id/like", ensureAuthenticated, likePost);
router.delete("/:id/like", ensureAuthenticated, unlikePost);

// Comments
router.post(
  "/:id/comments",
  ensureAuthenticated,
  [body("content").isLength({ min: 1, max: 2000 }).trim()],
  addComment
);

export default router;
