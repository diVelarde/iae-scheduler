import { useEffect, useState } from "react";

function App() {
  const [schedules, setSchedules] = useState([]);

  // fetch data from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/schedules")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Class Schedules</h1>

      {schedules.length === 0 ? (
        <p>No schedules found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Course</th>
              <th>Section</th>
              <th>Room</th>
              <th>Day</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((sched) => (
              <tr key={sched.schedule_id}>
                <td>{sched.course_code}</td>
                <td>{sched.section}</td>
                <td>{sched.room_id}</td>
                <td>{sched.day}</td>
                <td>
                  {sched.start_time} - {sched.end_time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;