require('dotenv').config();
const pool = require('./pool');

const SQL = `
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('driver','broker','shipper');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE detention_status AS ENUM ('pending','approved','disputed','paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'driver',
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  load_number TEXT NOT NULL,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  broker_email TEXT,
  facility_name TEXT,
  appointment_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS loads_driver_idx ON loads(driver_id);

CREATE TABLE IF NOT EXISTS arrival_events (
  id SERIAL PRIMARY KEY,
  load_id INTEGER NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  arrived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS arrival_load_idx ON arrival_events(load_id);

CREATE TABLE IF NOT EXISTS detention_records (
  id SERIAL PRIMARY KEY,
  load_id INTEGER NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  detention_started_at TIMESTAMPTZ,
  detention_ended_at TIMESTAMPTZ,
  hours_detained NUMERIC(6,2),
  total_owed NUMERIC(10,2),
  status detention_status NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS detention_load_idx ON detention_records(load_id);
`;

(async () => {
  try {
    await pool.query(SQL);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
