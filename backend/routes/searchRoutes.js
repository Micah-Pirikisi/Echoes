import { Router } from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import {
  searchPosts,
  searchUsers,
  getTrendingHashtags,
  getPostsByHashtag,
} from "../controllers/searchController.js";

const router = Router();

router.get("/posts", ensureAuthenticated, searchPosts);
router.get("/users", ensureAuthenticated, searchUsers);
router.get("/trending-hashtags", ensureAuthenticated, getTrendingHashtags);
router.get("/hashtags/:tag", ensureAuthenticated, getPostsByHashtag);

export default router;
