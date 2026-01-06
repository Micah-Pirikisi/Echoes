import { Router } from "express";
import { body } from "express-validator";
import { ensureAuthenticated } from "../middleware/auth.js";
import {
  getFeed,
  createPost,
  likePost,
  unlikePost,
  addComment,
} from "../controllers/postController.js";

const router = Router();

router.get("/feed", ensureAuthenticated, getFeed);

router.post(
  "/",
  ensureAuthenticated,
  body("content").isLength({ min: 1, max: 5000 }).trim(),
  createPost
);

router.post("/:id/like", ensureAuthenticated, likePost);
router.delete("/:id/like", ensureAuthenticated, unlikePost);

router.post(
  "/:id/comments",
  ensureAuthenticated,
  body("content").isLength({ min: 1, max: 2000 }).trim(),
  addComment
);

export default router;
