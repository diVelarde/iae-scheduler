function detectConflicts(schedules) {
  const conflicts = [];

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];

      if (a.day !== b.day) continue;

      const timeOverlap =
        a.start_time < b.end_time &&
        a.end_time   > b.start_time;

      if (!timeOverlap) continue;

      const roomConflict    = a.room_id === b.room_id;
      const sectionConflict = a.section && b.section && a.section === b.section;

      if (roomConflict || sectionConflict) {
        conflicts.push({
          type: roomConflict ? "room" : "section",
          schedule_1: {
            id:      a.schedule_id,
            course:  a.course_code,
            section: a.section,
            room:    a.room_id,
            day:     a.day,
            time:    `${a.start_time} – ${a.end_time}`
          },
          schedule_2: {
            id:      b.schedule_id,
            course:  b.course_code,
            section: b.section,
            room:    b.room_id,
            day:     b.day,
            time:    `${b.start_time} – ${b.end_time}`
          },
          reason: roomConflict
            ? `Room '${a.room_id}' is double-booked on ${a.day}`
            : `Section '${a.section}' has overlapping classes on ${a.day}`,
          suggestion: roomConflict
            ? `Move one class to a different room or time slot on ${a.day}`
            : `Move one class to a different time slot on ${a.day}`
        });
      }
    }
  }

  return conflicts;
}

module.exports = { detectConflicts };