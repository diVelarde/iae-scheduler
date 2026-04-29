function detectConflicts(schedules) {
  const conflicts = [];

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {

      const a = schedules[i];
      const b = schedules[j];

      const sameDay = a.day === b.day;
      const sameRoom = a.room_id === b.room_id;

      const overlap =
        a.start_time < b.end_time &&
        a.end_time > b.start_time;

      if (sameDay && sameRoom && overlap) {
        conflicts.push({
          schedule_1: a,
          schedule_2: b,
          reason: "Room + Time overlap"
        });
      }
    }
  }

  return conflicts;
}

module.exports = { detectConflicts };