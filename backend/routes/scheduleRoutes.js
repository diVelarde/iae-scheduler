const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE SINGLE SCHEDULE
router.post("/", async (req, res) => {
  try {
    const {
      course_code,
      section,
      room_id,
      day,
      start_time,
      end_time,
      capacity
    } = req.body;

    // VALIDATION
    if (!course_code || !room_id || !day || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // CHECK CONFLICT (TIME ONLY)
    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
       AND LOWER(day) = LOWER($2)
       AND (
         start_time < $4::time
         AND end_time > $3::time
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
      `INSERT INTO schedules
      (course_code, section, room_id, day, start_time, end_time, capacity)
      VALUES ($1,$2,$3,$4,$5::time,$6::time,$7)
      RETURNING *`,
      [course_code, section, room_id, day, start_time, end_time, capacity]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating schedule");
  }
});

// GENERATE SCHEDULE
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

            if (room.capacity < course.section_capacity) continue;

            // CONFLICT CHECK
            const conflict = await pool.query(
              `SELECT * FROM schedules
               WHERE room_id = $1
               AND LOWER(day) = LOWER($2)
               AND (
                 start_time < $4::time
                 AND end_time > $3::time
               )`,
              [room.room_id, day, slot.start, slot.end]
            );

            if (conflict.rows.length === 0) {

              const result = await pool.query(
                `INSERT INTO schedules
                (course_code, section, room_id, day, start_time, end_time, capacity)
                VALUES ($1,$2,$3,$4,$5::time,$6::time,$7)
                RETURNING *`,
                [
                  course.course_code,
                  course.section || "A",
                  room.room_id,
                  day,
                  slot.start,
                  slot.end,
                  course.section_capacity
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
          status: "FAILED - No slot"
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


// GET ALL SCHEDULES
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules ORDER BY schedule_id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching schedules");
  }
});

// UPDATE SCHEDULE (WITH CONFLICT CHECK)
router.put("/:scheduleId", async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { room_id, time_start, time_end } = req.body;

    // VALIDATION
    if (!room_id || !time_start || !time_end) {
      return res.status(400).json({
        message: "Missing required fields (room_id, time_start, time_end)"
      });
    }

    // GET CURRENT SCHEDULE (to keep day & course info)
    const existing = await pool.query(
      "SELECT * FROM schedules WHERE schedule_id = $1",
      [scheduleId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found"
      });
    }

    const current = existing.rows[0];

    // CONFLICT CHECK (EXCLUDE CURRENT RECORD)
    const conflict = await pool.query(
      `SELECT * FROM schedules
       WHERE room_id = $1
       AND LOWER(day) = LOWER($2)
       AND schedule_id != $5
       AND (
         start_time < $4::time
         AND end_time > $3::time
       )`,
      [room_id, current.day, time_start, time_end, scheduleId]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({
        message: "Update would cause conflict",
        conflict: conflict.rows
      });
    }

    // UPDATE
    const result = await pool.query(
      `UPDATE schedules
       SET room_id = $1,
           start_time = $2::time,
           end_time = $3::time
       WHERE schedule_id = $4
       RETURNING *`,
      [room_id, time_start, time_end, scheduleId]
    );

    res.json({
      message: "Schedule updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating schedule");
  }
});

// CONFLICT REPORT
router.get("/conflicts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM schedules");

    const schedules = result.rows;
    let conflicts = [];

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const a = schedules[i];
        const b = schedules[j];

        if (
          a.room_id === b.room_id &&
          a.day === b.day &&
          a.start_time < b.end_time &&
          a.end_time > b.start_time
        ) {
          conflicts.push({ a, b });
        }
      }
    }

    res.json({
      total_schedules: schedules.length,
      total_conflicts: conflicts.length,
      conflicts
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating conflict report");
  }
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
    await pool.query("TRUNCATE schedules RESTART IDENTITY");

    res.json({
      message: "System reset complete"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error resetting system");
  }
});

module.exports = router;