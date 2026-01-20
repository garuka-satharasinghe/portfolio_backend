const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

require("dotenv").config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register
router.post(
  "/auth/register",
  [
    body("username").isString().isLength({ min: 3, max: 50 }).trim(),
    body("password").isString().isLength({ min: 6, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await User.create({ username, passwordHash });
      const token = signToken(user);

      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600 * 1000,
        })
        .status(201)
        .json({ id: user._id, username: user.username });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Login
router.post(
  "/auth/login",
  [
    body("username").isString().trim(),
    body("password").isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = signToken(user);
      res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600 * 1000,
        })
        .json({ id: user._id, username: user.username });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Logout
router.post("/auth/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .json({ message: "Logged out" });
});

// Me (example protected route using header token)
router.get("/auth/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieToken = req.cookies?.token;

  const jwtToken = token || cookieToken;
  if (!jwtToken) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(jwtToken, JWT_SECRET);
    return res.json({ id: payload.sub, username: payload.username });
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
