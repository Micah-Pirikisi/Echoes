import { Router } from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import {
  getAllUsers,
  getIncomingFollowRequests,
  getUserById,
  createFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  updateAvatar,
  updateBio,
} from "../controllers/userController.js";
import { body } from "express-validator";

const router = Router();

router.get("/", ensureAuthenticated, getAllUsers);
router.get(
  "/follow-requests/incoming",
  ensureAuthenticated,
  getIncomingFollowRequests
);
router.get("/:id", ensureAuthenticated, getUserById);
router.post("/:id/follow-request", ensureAuthenticated, createFollowRequest);
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
router.post(
  "/me/avatar",
  ensureAuthenticated,
  [body("avatarUrl").isURL()],
  updateAvatar
);
router.post(
  "/me/bio",
  ensureAuthenticated,
  [body("bio").isString().trim().isLength({ max: 500 })],
  updateBio
);

export default router;
