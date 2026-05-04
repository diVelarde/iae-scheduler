require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const passport = require("./config/passport");

const authRoutes     = require("./routes/authRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const courseRoutes   = require("./routes/courseRoutes");
const roomRoutes     = require("./routes/roomRoutes");

const { authenticate } = require("./middleware/auth");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// ─── Public routes ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Protected routes (require valid JWT) ──────────────────────────────────
app.use("/api/schedules", authenticate, scheduleRoutes);
app.use("/api/courses",   authenticate, courseRoutes);
app.use("/api/rooms",     authenticate, roomRoutes);

// ─── Health check ───────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
  try {
    const pool = require("./config/db");
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "OK", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "DB connection failed", error: err.message });
  }
});

app.get("/setup-courses", async (req, res) => {
  try {
    const pool = require("./config/db");
    await pool.query(`
      ALTER TABLE course_offerings 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()
    `);
    res.json({ message: "course_offerings table updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  console.log(`GOOGLE_CLIENT_ID set: ${!!process.env.GOOGLE_CLIENT_ID}`);
});