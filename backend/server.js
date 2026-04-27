const express = require("express");
const pool = require("./db");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
app.use(express.json());

// use routes
app.use("/api/schedules", scheduleRoutes);

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});