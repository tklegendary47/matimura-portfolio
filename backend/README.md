# Matimura Portfolio — Backend

A small Node.js + Express + MongoDB API that gives the portfolio a real
backend: it stores contact form submissions and can serve project data
dynamically. It also serves the static frontend itself, so in local
development one command runs the entire site.

## How it connects to the frontend (the short version)

```
Browser  →  loads index.html, css/, js/  (static files)
   │
   │  user fills out contact.html and clicks "Send Message"
   ▼
js/main.js  →  fetch('/api/contact', { method: 'POST', body: {...} })
   │
   ▼
backend/server.js  →  routes/contact.js  →  models/ContactMessage.js
   │
   ▼
MongoDB  (the submission is saved as a document)
   │
   └── optionally: nodemailer emails you a copy, if SMTP is configured
```

Because `server.js` serves the frontend folder itself
(`app.use(express.static(path.join(__dirname, '..')))`), the browser and the
API are on the *same origin* in local development — `fetch('/api/contact')`
just works, with no CORS configuration needed. If you later deploy the
frontend and backend to two different domains (e.g. frontend on Netlify,
backend on Render), set `ALLOWED_ORIGINS` in `.env` to your frontend's URL
and the CORS middleware in `server.js` will allow it.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# then open .env and fill in MONGODB_URI at minimum
```

Get a free `MONGODB_URI` in about five minutes:
1. Create a free cluster at https://www.mongodb.com/atlas
2. Add a database user and password
3. Under Network Access, allow your IP (or 0.0.0.0/0 while developing)
4. Copy the connection string it gives you into `.env`

## Running it

```bash
npm run seed   # loads the AEO Citation System + TalentTrack into MongoDB
npm start      # http://localhost:3000  — serves the whole site + API
```

Open `http://localhost:3000` in a browser — you'll see the exact same
portfolio, now with a working contact form.

## What each file does

| File                          | Purpose                                                             |
|-------------------------------|----------------------------------------------------------------------|
| `server.js`                   | Starts Express, connects to MongoDB, mounts routes, serves the frontend |
| `config/db.js`                | Opens the MongoDB connection                                       |
| `models/ContactMessage.js`    | Schema for a contact form submission                                |
| `models/Project.js`           | Schema for a project (for the optional dynamic project list)        |
| `routes/contact.js`           | `POST /api/contact` — validates and saves a message, emails you    |
| `routes/projects.js`          | `GET /api/projects` (public), `POST` / `PUT` (protected)            |
| `middleware/requireAdminKey.js` | Protects write endpoints with a shared secret key                |
| `seed.js`                     | One-time script to load your two current projects into MongoDB     |

## API reference

### `POST /api/contact`
Body: `{ "name": "...", "email": "...", "project": "...", "message": "..." }`
Returns `201` with `{ ok: true, id }` on success, `400` if fields are missing
or the email looks invalid, `429` if more than 10 requests come from the same
IP in 15 minutes.

### `GET /api/projects`
Public. Returns every project as JSON, sorted by `order`. Not wired into the
frontend by default (the site currently uses hardcoded HTML so it always
looks right even without the backend running) — but you can fetch this
endpoint from `projects.html` or `roadmap.html` later if you want the cards
to update without touching HTML.

### `POST /api/projects` and `PUT /api/projects/:id`
Protected. Requires header `x-api-key: <your ADMIN_API_KEY>`. Lets you add or
update a project from a script, Postman, or a future admin page — without
redeploying the frontend.

## Deploying it for real

- **Backend**: Render, Railway, or Fly.io all have free/cheap tiers that run
  a Node/Express app well. Set your `.env` values as environment variables
  there (never commit the real `.env` file).
- **Database**: MongoDB Atlas free tier is enough for a portfolio contact
  form and a handful of projects.
- **Frontend**: if you deploy it separately (e.g. Netlify, Vercel), set
  `ALLOWED_ORIGINS` on the backend to that URL, and change the `fetch('/api/contact')`
  call in `js/main.js` to the full backend URL, e.g.
  `fetch('https://your-api.onrender.com/api/contact')`.
- Simplest path: deploy the whole `matimura-portfolio` folder (frontend +
  backend together) to Render as one Node service — `server.js` already
  serves both, so nothing else changes.
