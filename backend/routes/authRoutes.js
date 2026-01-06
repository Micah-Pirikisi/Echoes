import { Router } from "express";
import passport from "passport";
import { body } from "express-validator";
import {
  signup,
  login,
  logout,
  guestLogin,
} from "../controllers/authController.js";

const router = Router();

// Signup route
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").isLength({ min: 2 }),
  ],
  signup
);

// Login route
router.post("/login", passport.authenticate("local"), login);

// Logout route
router.post("/logout", logout);

// Guest login route
router.post("/guest", guestLogin);

export default router;
