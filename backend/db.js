const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "iae_scheduler",
  password: "0806365",
  port: 5432,
});

module.exports = pool;