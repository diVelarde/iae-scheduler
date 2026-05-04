const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios");

// ─── GET /api/courses/offerings ───────────────────────────────────────────────
router.get("/offerings", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT course_code, section, units, section_capacity, semester
       FROM course_offerings
       ORDER BY course_code, section`
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching course offerings" });
  }
});

// ─── POST /api/courses/sync ───────────────────────────────────────────────────
// Manually triggered by admin — fetches courses from Course Management Subsystem
// and upserts them into our course_offerings table
router.post("/sync", async (req, res) => {
  const COURSE_MANAGEMENT_API = process.env.COURSE_MANAGEMENT_API ||
    "https://placeholder-course-management.onrender.com/api/courses";

  try {
    const response = await axios.get(COURSE_MANAGEMENT_API, {
      timeout: 10000
    });

    const courses = response.data.courses || response.data;

    if (!courses || courses.length === 0) {
      return res.status(400).json({ message: "No courses received from Course Management Subsystem" });
    }

    let synced = 0;
    let failed = [];

    for (const course of courses) {
      const { course_code, section, units, section_capacity, semester } = course;

      if (!course_code || !section || !units || !section_capacity || !semester) {
        failed.push({ course_code, reason: "Missing required fields" });
        continue;
      }

      await pool.query(
        `INSERT INTO course_offerings (course_code, section, units, section_capacity, semester)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (course_code, section, semester)
         DO UPDATE SET
           units            = EXCLUDED.units,
           section_capacity = EXCLUDED.section_capacity`,
        [course_code, section, units, section_capacity, semester]
      );

      synced++;
    }

    res.json({
      message: "Sync complete",
      total_received: courses.length,
      total_synced: synced,
      failed
    });

  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({
        message: "Could not reach Course Management Subsystem",
        hint: "Check that COURSE_MANAGEMENT_API is set correctly in your environment variables",
        error: err.message
      });
    }

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "Request to Course Management Subsystem timed out"
      });
    }

    console.error(err);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});

router.get("/sync/status", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total,
              MAX(created_at) as last_synced
       FROM course_offerings`
    );
    res.json({
      total_courses: parseInt(result.rows[0].total),
      last_synced: result.rows[0].last_synced || "Never"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching sync status" });
  }
});

module.exports = router;