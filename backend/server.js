const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();

app.use(cors()); 
app.use(express.json());

app.use("/api/schedules", scheduleRoutes);

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});