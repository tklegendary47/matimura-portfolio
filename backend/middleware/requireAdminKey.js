// Simple shared-secret protection for the write endpoints (creating/editing
// projects). Not bank-grade auth, but enough to stop randoms on the internet
// from rewriting your project list. Send the key as: x-api-key: <your key>
module.exports = function requireAdminKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ADMIN_API_KEY not set.' });
  }
  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Missing or invalid API key.' });
  }
  next();
};
