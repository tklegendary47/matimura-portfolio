// Backs the /api/projects endpoint so project cards can eventually be
// managed without editing HTML by hand.
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  role:        { type: String },
  description: { type: String, required: true },
  tags:        [{ type: String }],
  status:      { type: String, enum: ['live', 'build', 'planned'], default: 'planned' },
  liveUrl:     { type: String, default: '' },
  stats:       [{ label: String, value: String }],
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
