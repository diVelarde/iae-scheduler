const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /api/rooms
// Returns all rooms
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM rooms ORDER BY type, room_id"
    );
    res.json({ rooms: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

// GET /api/rooms/available?day=Monday&start_time=08:00&end_time=10:00
// Returns rooms not booked in the given window (omit query params to get all)
router.get("/available", async (req, res) => {
  try {
    const { day, start_time, end_time } = req.query;

    let result;

    if (day && start_time && end_time) {
      result = await pool.query(
        `SELECT r.* FROM rooms r
         WHERE r.room_id NOT IN (
           SELECT s.room_id FROM schedules s
           WHERE LOWER(s.day) = LOWER($1)
             AND s.start_time < $3::time
             AND s.end_time   > $2::time
         )
         ORDER BY r.type, r.room_id`,
        [day, start_time, end_time]
      );
    } else {
      result = await pool.query(
        "SELECT * FROM rooms ORDER BY type, room_id"
      );
    }

    res.json({ rooms: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching available rooms" });
  }
});

// POST /api/rooms
// Add a new room
router.post("/", async (req, res) => {
  try {
    const { room_id, capacity, type } = req.body;

    if (!room_id || !capacity || !type) {
      return res.status(400).json({ message: "room_id, capacity, and type are required" });
    }

    if (!["Lecture", "Laboratory"].includes(type)) {
      return res.status(400).json({ message: "type must be 'Lecture' or 'Laboratory'" });
    }

    const result = await pool.query(
      `INSERT INTO rooms (room_id, capacity, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (room_id) DO NOTHING
       RETURNING *`,
      [room_id, capacity, type]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ message: `Room '${room_id}' already exists` });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding room" });
  }
});

// PUT /api/rooms/:roomId
// Update room capacity or type
router.put("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { capacity, type } = req.body;

    const updates = [];
    const params = [];

    if (capacity) { params.push(capacity); updates.push(`capacity = $${params.length}`); }
    if (type)     { params.push(type);     updates.push(`type = $${params.length}`); }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    params.push(roomId);
    const result = await pool.query(
      `UPDATE rooms SET ${updates.join(", ")} WHERE room_id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Room '${roomId}' not found` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating room" });
  }
});

// DELETE /api/rooms/:roomId
// Remove a room (only if no active schedules)
router.delete("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const active = await pool.query(
      "SELECT schedule_id FROM schedules WHERE room_id = $1 LIMIT 1",
      [roomId]
    );

    if (active.rows.length > 0) {
      return res.status(409).json({
        message: `Cannot remove '${roomId}' — it has active schedules. Delete or reassign them first.`
      });
    }

    const result = await pool.query(
      "DELETE FROM rooms WHERE room_id = $1 RETURNING room_id",
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Room '${roomId}' not found` });
    }

    res.json({ message: "Room successfully removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing room" });
  }
});

module.exports = router;