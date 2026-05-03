const { Pool } = require("pg");

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user:     process.env.DB_USER     || "postgres",
      host:     process.env.DB_HOST     || "localhost",
      database: process.env.DB_NAME     || "iae_scheduler",
      password: process.env.DB_PASSWORD || "0806365",
      port:     parseInt(process.env.DB_PORT || "5432", 10)
    });

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ DB connection error:", err.message);
    console.error("Full error:", JSON.stringify(err, null, 2));
  } else {
    console.log("✅ Connected to PostgreSQL");
    release();
  }
});

module.exports = pool;