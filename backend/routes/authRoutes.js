const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email:   user.email,
        name:    user.name,
        role:    user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/auth/callback?token=${token}`);
  }
);

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      user_id: decoded.user_id,
      email:   decoded.email,
      name:    decoded.name,
      role:    decoded.role
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;