require("dotenv").config();
const express = require("express");
const cors = require("cors");
const scheduleRoutes = require("./routes/scheduleRoutes");
const courseRoutes = require("./routes/courseRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/schedules", scheduleRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/rooms", roomRoutes);

// Health check — tests DB only when this route is called
app.get("/", async (req, res) => {
  try {
    const pool = require("./config/db");
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "OK", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "DB connection failed", error: err.message });
  }
});

app.get("/setup-users", async (req, res) => {
  try {
    const pool = require("./config/db");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id   SERIAL       PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email     VARCHAR(255) UNIQUE NOT NULL,
        name      VARCHAR(255) NOT NULL,
        role      VARCHAR(50)  NOT NULL DEFAULT 'student'
      )
    `);
    res.json({ message: "Users table created!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`); // tells you if env var is loaded
});