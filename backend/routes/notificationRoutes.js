import { Router } from "express";
import { ensureAuthenticated } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", ensureAuthenticated, getNotifications);
router.get("/unread", ensureAuthenticated, getUnreadCount);
router.patch("/:id", ensureAuthenticated, markAsRead);
router.patch("/mark-all/read", ensureAuthenticated, markAllAsRead);

export default router;
