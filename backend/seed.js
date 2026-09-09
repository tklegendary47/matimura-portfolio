// Run with: npm run seed
// Populates MongoDB with the same projects currently hardcoded in the HTML,
// so /api/projects returns real data from day one.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');

const projects = [
  {
    title: 'AEO Citation System',
    slug: 'aeo-citation-system',
    role: 'Technical Lead & Co-Founder',
    description: 'Diagnostic SaaS platform tracking whether businesses are cited by ChatGPT, Perplexity, Claude, Gemini, and Google AI.',
    tags: ['SaaS', 'Node.js', 'Express', 'MongoDB'],
    status: 'build',
    liveUrl: '',
    stats: [
      { label: 'Week Roadmap', value: '24' },
      { label: 'AI Engines Tracked', value: '5' },
      { label: 'Co-Founders', value: '2' },
    ],
    order: 1,
  },
  {
    title: 'TalentTrack',
    slug: 'talenttrack',
    role: 'Solo Developer — WDD 231 Capstone',
    description: 'Fully responsive job board with dynamic JSON-driven listings, real-time filtering, and localStorage bookmarking.',
    tags: ['Vanilla JS', 'JSON', 'Accessibility'],
    status: 'live',
    liveUrl: '',
    stats: [
      { label: 'Final Grade', value: '92.5%' },
      { label: 'Responsive', value: '100%' },
    ],
    order: 2,
  },
];

(async () => {
  await connectDB();
  for (const p of projects) {
    await Project.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
    console.log(`[seed] upserted: ${p.title}`);
  }
  await mongoose.disconnect();
  console.log('[seed] done.');
})();
