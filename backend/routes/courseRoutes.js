const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios");

// GET /api/courses/offerings
// Standalone: returns from local DB
// If COURSE_MANAGEMENT_API env var is set, syncs from external subsystem first
router.get("/offerings", async (req, res) => {
  try {
    if (process.env.COURSE_MANAGEMENT_API) {
      try {
        const response = await axios.get(process.env.COURSE_MANAGEMENT_API, {
          timeout: 8000
        });

        const courses = response.data.courses || response.data;

        if (courses && courses.length > 0) {
          for (const course of courses) {
            const { course_code, section, units, section_capacity, semester } = course;
            if (!course_code || !units || !section_capacity || !semester) continue;

            await pool.query(
              `INSERT INTO course_offerings (course_code, section, units, section_capacity, semester)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (course_code, section, semester)
               DO UPDATE SET
                 units            = EXCLUDED.units,
                 section_capacity = EXCLUDED.section_capacity`,
              [course_code, section || null, units, section_capacity, semester]
            );
          }
        }
      } catch (syncErr) {
        // External API failed — still return local data
        console.warn("Could not sync from Course Management API:", syncErr.message);
      }
    }

    const result = await pool.query(
      `SELECT course_code, units, section_capacity, semester
       FROM course_offerings
       ORDER BY course_code`
    );

    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching course offerings" });
  }
});

module.exports = router;