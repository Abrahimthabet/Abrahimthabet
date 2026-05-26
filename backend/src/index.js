require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clerkAuth = require('./middleware/clerkAuth');
const loadsRouter = require('./routes/loads');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/loads', clerkAuth, loadsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => {
  console.log(`HaulClock API listening on :${port}`);
});
