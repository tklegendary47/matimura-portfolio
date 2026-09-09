// Every submission from contact.html is stored as one of these documents.
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 120 },
  email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  project: { type: String, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 4000 },
  status:  { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
