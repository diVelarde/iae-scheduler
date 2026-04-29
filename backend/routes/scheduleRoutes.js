const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE schedule
router.post("/", async (req, res) => {
  try {
    const { course_code, section, room_id, day, start_time, end_time } = req.body;

    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
       AND day = $2
       AND (
         ($3 < end_time AND $4 > start_time)
       )`,
      [room_id, day, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({
        message: "Schedule conflict detected",
        conflict: conflict.rows
      });
    }

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