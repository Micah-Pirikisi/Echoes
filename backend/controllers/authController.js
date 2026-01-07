import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";
import { validationResult } from "express-validator";

// Signup controller
export const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password, name } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    req.login({ id: user.id }, (err) => {
      if (err) return next(err);
      res.json({ id: user.id, email: user.email, name: user.name });
    });
  } catch (err) {
    next(err);
  }
};

// Login controller
export const login = (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
};

// Logout controller
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out" });
  });
};

// Guest login controller
export const guestLogin = async (req, res, next) => {
  try {
    console.log("Guest login attempt");
    const email = process.env.GUEST_EMAIL;
    const pwd = process.env.GUEST_PASSWORD;
    console.log("Email:", email);

    let user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", !!user);

    if (!user) {
      const passwordHash = await bcrypt.hash(pwd, 10);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: "Guest",
          isGuest: true,
          avatarUrl: "https://www.gravatar.com/avatar?d=identicon",
        },
      });
      console.log("Guest user created");
    }

    req.login({ id: user.id }, (err) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      console.log("Login successful");
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        guest: true,
      });
    });
  } catch (err) {
    console.error("Guest login error:", err);
    next(err);
  }
};
