const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const pool = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL ||
                    "http://localhost:5000/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name  = profile.displayName;

        // Upsert user — insert on first login, return existing on subsequent logins
        const { rows } = await pool.query(
          `INSERT INTO users (google_id, email, name, role)
           VALUES ($1, $2, $3, 'student')
           ON CONFLICT (google_id)
           DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
           RETURNING *`,
          [profile.id, email, name]
        );

        return done(null, rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;