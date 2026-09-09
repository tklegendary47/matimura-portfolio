// ============================================================================
// MATIMURA PORTFOLIO — API SERVER
// Handles: contact form submissions, project data.
// Also serves the static frontend (../ index.html, css/, js/) from the same
// process, so in local dev one command runs the whole site — no CORS needed.
// ============================================================================
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contact');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json({ limit: '20kb' }));

// Only needed if the frontend is hosted on a different domain than this API
// (e.g. frontend on Netlify, backend on Render). Same-origin setups below
// don't need this at all.
if (process.env.ALLOWED_ORIGINS) {
  const allowed = process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
  app.use(cors({ origin: allowed }));
}

// Basic abuse protection on the public write endpoint.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 submissions per IP per window
  message: { error: 'Too many messages sent — please try again later.' },
});

app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve the static frontend site (the folder one level up from /backend).
app.use(express.static(path.join(__dirname, '..')));

app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => {
  console.log(`[server] Running at http://localhost:${PORT}`);
});
