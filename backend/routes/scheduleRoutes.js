const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE schedule
router.post("/", async (req, res) => {
  try {
    const { course_code, section, room_id, day, start_time, end_time } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (course_code, section, room_id, day, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_code, section, room_id, day, start_time, end_time]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating schedule");
  }
});

// GET all schedules
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching schedules");
  }
});

module.exports = router;