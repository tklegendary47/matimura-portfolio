const express = require('express');
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// Builds a mail transporter only if SMTP settings exist — email is optional.
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

// POST /api/contact — called by the form on contact.html
router.post('/', async (req, res) => {
  const { name, email, project, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'That email address doesn\'t look valid.' });
  }

  try {
    const saved = await ContactMessage.create({ name, email, project, message });

    const transporter = getTransporter();
    if (transporter && process.env.CONTACT_TO_EMAIL) {
      transporter.sendMail({
        from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `New project inquiry from ${name}`,
        text: `From: ${name} <${email}>\nProject: ${project || 'n/a'}\n\n${message}`,
      }).catch(err => console.error('[mail] send failed:', err.message));
    }

    res.status(201).json({ ok: true, id: saved._id });
  } catch (err) {
    console.error('[contact] save failed:', err.message);
    res.status(500).json({ error: 'Something went wrong saving your message. Please try again.' });
  }
});

module.exports = router;
