const express = require('express');
const pool = require('../db/pool');
const { computeDetention } = require('../lib/detention');

const router = express.Router();

async function upsertUserByClerkId(clerkId) {
  const { rows } = await pool.query(
    `INSERT INTO users (clerk_id, role)
     VALUES ($1, 'driver')
     ON CONFLICT (clerk_id) DO UPDATE SET clerk_id = EXCLUDED.clerk_id
     RETURNING *`,
    [clerkId]
  );
  return rows[0];
}

// POST /loads
router.post('/', async (req, res) => {
  try {
    const { load_number, broker_email, facility_name, appointment_time } = req.body;
    if (!load_number) return res.status(400).json({ error: 'load_number required' });

    const driver = await upsertUserByClerkId(req.auth.userId);
    const { rows } = await pool.query(
      `INSERT INTO loads (load_number, driver_id, broker_email, facility_name, appointment_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [load_number, driver.id, broker_email || null, facility_name || null, appointment_time || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create load' });
  }
});

// POST /loads/:id/checkin
router.post('/:id/checkin', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    await client.query('BEGIN');
    const arrival = await client.query(
      `INSERT INTO arrival_events (load_id, latitude, longitude)
       VALUES ($1, $2, $3) RETURNING *`,
      [id, latitude ?? null, longitude ?? null]
    );
    const arrivedAt = arrival.rows[0].arrived_at;
    const det = computeDetention(arrivedAt);

    await client.query(
      `INSERT INTO detention_records (load_id, detention_started_at, hours_detained, total_owed, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [id, det.detention_started_at, det.hours_detained, det.total_owed]
    );
    await client.query('COMMIT');
    res.status(201).json({ arrival: arrival.rows[0], detention: det });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Check-in failed' });
  } finally {
    client.release();
  }
});

// GET /loads/driver/:clerk_id   (must be registered before /:id)
router.get('/driver/:clerk_id', async (req, res) => {
  try {
    const { clerk_id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*,
              (SELECT row_to_json(a) FROM (
                 SELECT arrived_at, latitude, longitude
                 FROM arrival_events WHERE load_id = l.id
                 ORDER BY arrived_at ASC LIMIT 1) a) AS arrival,
              (SELECT row_to_json(d) FROM (
                 SELECT detention_started_at, detention_ended_at, hours_detained, total_owed, status
                 FROM detention_records WHERE load_id = l.id
                 ORDER BY id DESC LIMIT 1) d) AS detention
       FROM loads l
       JOIN users u ON u.id = l.driver_id
       WHERE u.clerk_id = $1
       ORDER BY l.created_at DESC`,
      [clerk_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch loads' });
  }
});

// GET /loads/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const loadQ = await pool.query(`SELECT * FROM loads WHERE id = $1`, [id]);
    if (!loadQ.rows[0]) return res.status(404).json({ error: 'Load not found' });

    const arrivalQ = await pool.query(
      `SELECT * FROM arrival_events WHERE load_id = $1 ORDER BY arrived_at ASC LIMIT 1`,
      [id]
    );
    const detQ = await pool.query(
      `SELECT * FROM detention_records WHERE load_id = $1 ORDER BY id DESC LIMIT 1`,
      [id]
    );

    const arrival = arrivalQ.rows[0] || null;
    const liveDetention = arrival ? computeDetention(arrival.arrived_at) : null;

    res.json({
      load: loadQ.rows[0],
      arrival,
      detention_record: detQ.rows[0] || null,
      detention_live: liveDetention,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch load' });
  }
});

module.exports = router;
