const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { detectConflicts } = require("../utils/conflictEngine");


// CREATE SINGLE SCHEDULE
router.post("/", async (req, res) => {
  try {
    const { course_code, section, room_id, day, start_time, end_time } = req.body;

    // CONFLICT CHECK
    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
       AND day = $2
       AND ($3 < end_time AND $4 > start_time)`,
      [room_id, day, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({
        message: "Schedule conflict detected",
        conflict: conflict.rows
      });
    }

    const result = await pool.query(
      `INSERT INTO schedules
      (course_code, section, room_id, day, start_time, end_time)
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

// GET ALL SCHEDULES
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules");
  res.json(result.rows);
});

// AUTO GENERATE SCHEDULE
router.post("/generate", async (req, res) => {
  try {
    const courses = await pool.query("SELECT * FROM courses");
    const rooms = await pool.query("SELECT * FROM rooms");

    const days = ["Monday", "Tuesday", "Wednesday"];

    const timeSlots = [
      { start: "08:00", end: "10:00" },
      { start: "10:00", end: "12:00" },
      { start: "13:00", end: "15:00" },
      { start: "15:00", end: "17:00" }
    ];

    const generated = [];

    for (const course of courses.rows) {
      let scheduled = false;

      for (const day of days) {
        for (const slot of timeSlots) {
          for (const room of rooms.rows) {

            if (room.capacity < course.student_count) continue;

            const conflict = await pool.query(
              `SELECT * FROM schedules
               WHERE room_id = $1
               AND day = $2
               AND ($3 < end_time AND $4 > start_time)`,
              [room.room_id, day, slot.start, slot.end]
            );

            if (conflict.rows.length === 0) {

              const result = await pool.query(
                `INSERT INTO schedules
                (course_code, section, room_id, day, start_time, end_time)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                  course.course_code,
                  course.section,
                  room.room_id,
                  day,
                  slot.start,
                  slot.end
                ]
              );

              generated.push(result.rows[0]);
              scheduled = true;
              break;
            }
          }

          if (scheduled) break;
        }

        if (scheduled) break;
      }

      if (!scheduled) {
        generated.push({
          course_code: course.course_code,
          status: "FAILED"
        });
      }
    }

    res.json({
      message: "Schedule generated successfully",
      total: generated.length,
      data: generated
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating schedule");
  }
});

// CONFLICT REPORT
router.get("/conflicts", async (req, res) => {
  const result = await pool.query("SELECT * FROM schedules");
  const schedules = result.rows;

  const conflicts = detectConflicts(schedules);

  res.json({
    total_schedules: schedules.length,
    total_conflicts: conflicts.length,
    conflicts: conflicts
  });
});

// RESET SYSTEM
router.delete("/reset", async (req, res) => {
  const { confirm } = req.body;

  if (confirm !== "YES") {
    return res.status(400).json({
      message: "Reset not confirmed. Send { confirm: 'YES' }"
    });
  }

  try {
    await pool.query("TRUNCATE TABLE schedules RESTART IDENTITY");

    res.json({
      message: "System reset complete"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error resetting system");
  }
});

module.exports = router;