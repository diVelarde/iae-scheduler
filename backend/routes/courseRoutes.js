const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/courses/offerings
// Returns all course offerings with the fields the schedule generator needs
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

// POST /api/courses/offerings
// Add or update a course offering
router.post("/offerings", async (req, res) => {
  try {
    const { course_code, section, units, section_capacity, semester } = req.body;

    if (!course_code || !section || !units || !section_capacity || !semester) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO course_offerings (course_code, section, units, section_capacity, semester)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (course_code, section, semester)
       DO UPDATE SET units = EXCLUDED.units, section_capacity = EXCLUDED.section_capacity
       RETURNING *`,
      [course_code, section, units, section_capacity, semester]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving course offering" });
  }
});

module.exports = router;