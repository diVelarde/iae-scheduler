const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const axios = require("axios");
const { detectConflicts } = require("../utils/conflictEngine");

// POST /api/schedules
// Create a single schedule with conflict check
router.post("/", async (req, res) => {
  try {
    const { course_code, section, room_id, day, start_time, end_time, capacity } = req.body;

    if (!course_code || !room_id || !day || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Room conflict check
    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
         AND LOWER(day) = LOWER($2)
         AND start_time < $4::time
         AND end_time   > $3::time`,
      [room_id, day, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({
        message: "Schedule conflict detected",
        conflict: conflict.rows
      });
    }

    const result = await pool.query(
      `INSERT INTO schedules (course_code, section, room_id, day, start_time, end_time, capacity, status)
       VALUES ($1, $2, $3, $4, $5::time, $6::time, $7, 'scheduled')
       RETURNING *`,
      [course_code, section, room_id, day, start_time, end_time, capacity]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating schedule" });
  }
});

// POST /api/schedules/generate
// Auto-generate schedules for all course offerings
router.post("/generate", async (req, res) => {
  try {
    const courseResponse = await axios.get("http://localhost:5000/api/courses/offerings");
    const courses = courseResponse.data.courses;

    if (!courses || courses.length === 0) {
      return res.status(400).json({ message: "No course offerings available" });
    }

    const roomsResult = await pool.query("SELECT * FROM rooms");
    const rooms = roomsResult.rows;

    if (!rooms || rooms.length === 0) {
      return res.status(400).json({ message: "No rooms available" });
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const timeSlots = [
      { start: "07:30:00", end: "09:00:00" },
      { start: "09:00:00", end: "10:30:00" },
      { start: "10:30:00", end: "12:00:00" },
      { start: "13:00:00", end: "14:30:00" },
      { start: "14:30:00", end: "16:00:00" },
      { start: "16:00:00", end: "17:30:00" },
      { start: "18:00:00", end: "19:30:00" },
      { start: "19:30:00", end: "21:00:00" }
    ];

    const generated = [];

    for (const course of courses) {
      let scheduled = false;

      outer:
      for (const day of days) {
        for (const slot of timeSlots) {
          for (const room of rooms) {

            // Skip if room is too small
            if (room.capacity < course.section_capacity) continue;

            // Check room conflict for this slot
            const conflict = await pool.query(
              `SELECT schedule_id FROM schedules
               WHERE room_id = $1
                 AND LOWER(day) = LOWER($2)
                 AND start_time < $4::time
                 AND end_time   > $3::time`,
              [room.room_id, day, slot.start, slot.end]
            );

            if (conflict.rows.length === 0) {
              const result = await pool.query(
                `INSERT INTO schedules
                   (course_code, section, room_id, day, start_time, end_time, capacity, status)
                 VALUES ($1, $2, $3, $4, $5::time, $6::time, $7, 'scheduled')
                 RETURNING *`,
                [
                  course.course_code,
                  course.section || "AUTO",
                  room.room_id,
                  day,
                  slot.start,
                  slot.end,
                  course.section_capacity
                ]
              );

              generated.push(result.rows[0]);
              scheduled = true;
              break outer;
            }
          }
        }
      }

      if (!scheduled) {
        generated.push({
          course_code: course.course_code,
          section: course.section || "AUTO",
          status: "FAILED - No available slot"
        });
      }
    }

    res.json({
      message: "Schedule generation complete",
      total: generated.length,
      data: generated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating schedule", error: err.message });
  }
});

// GET /api/schedules
// Return all schedules ordered by day and start time
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM schedules
       ORDER BY
         CASE day
           WHEN 'Monday'    THEN 1 WHEN 'Tuesday'   THEN 2
           WHEN 'Wednesday' THEN 3 WHEN 'Thursday'  THEN 4
           WHEN 'Friday'    THEN 5 WHEN 'Saturday'  THEN 6
           WHEN 'Sunday'    THEN 7
         END,
         start_time`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching schedules" });
  }
});

// GET /api/schedules/conflicts
// ⚠️ Must be defined BEFORE /:scheduleId or Express will treat "conflicts" as an ID
router.get("/conflicts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY day, start_time");
    const conflicts = detectConflicts(result.rows);

    res.json({
      total_schedules: result.rows.length,
      total_conflicts: conflicts.length,
      conflicts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating conflict report" });
  }
});

// PUT /api/schedules/:scheduleId
// Update room and/or time — re-checks conflicts excluding itself
router.put("/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { room_id, time_start, time_end } = req.body;

    if (!room_id || !time_start || !time_end) {
      return res.status(400).json({
        message: "room_id, time_start, and time_end are required"
      });
    }

    const existing = await pool.query(
      "SELECT * FROM schedules WHERE schedule_id = $1",
      [scheduleId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const current = existing.rows[0];

    // Conflict check — exclude the record being updated
    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
         AND LOWER(day) = LOWER($2)
         AND schedule_id != $5
         AND start_time < $4::time
         AND end_time   > $3::time`,
      [room_id, current.day, time_start, time_end, scheduleId]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({
        message: "Update would cause a conflict",
        conflict: conflict.rows
      });
    }

    const result = await pool.query(
      `UPDATE schedules
       SET room_id    = $1,
           start_time = $2::time,
           end_time   = $3::time
       WHERE schedule_id = $4
       RETURNING *`,
      [room_id, time_start, time_end, scheduleId]
    );

    res.json({ message: "Schedule updated", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating schedule" });
  }
});

// DELETE /api/schedules/reset
// Wipe all schedules — requires { "confirm": "YES" }
router.delete("/reset", async (req, res) => {
  const { confirm } = req.body;

  if (confirm !== "YES") {
    return res.status(400).json({
      message: "Reset not confirmed. Send { \"confirm\": \"YES\" }"
    });
  }

  try {
    await pool.query("TRUNCATE schedules RESTART IDENTITY");
    res.json({ message: "System reset complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting system" });
  }
});

module.exports = router;