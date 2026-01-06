import { Router } from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import {
  listUsers,
  getUserProfile,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../controllers/userController.js";

const router = Router();

router.get("/", ensureAuthenticated, listUsers);
router.get("/:id", ensureAuthenticated, getUserProfile);

router.post("/:id/follow-request", ensureAuthenticated, sendFollowRequest);

router.post(
  "/follow-requests/:id/accept",
  ensureAuthenticated,
  acceptFollowRequest
);

router.post(
  "/follow-requests/:id/reject",
  ensureAuthenticated,
  rejectFollowRequest
);

export default router;
