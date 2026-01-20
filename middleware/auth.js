const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const tokenHeader = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const tokenCookie = req.cookies?.token;
  const token = tokenHeader || tokenCookie;

  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
