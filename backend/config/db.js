// Handles the single MongoDB connection the whole app shares.
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      '[db] No MONGODB_URI set — the API will run, but /api/contact and ' +
      '/api/projects will fail until you add a real connection string to .env'
    );
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('[db] Connected to MongoDB');
  } catch (err) {
    console.error('[db] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
