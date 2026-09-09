# Matimura Portfolio

A cinematic, multi-page portfolio for Takudzwa P. Matimura, with an optional
Node.js/Express/MongoDB backend for the contact form and project data.

## Structure

```
matimura-portfolio/
├── index.html          Home — hero, HUD photo module, featured work
├── projects.html        Full case studies (AEO Citation System, TalentTrack, product suite)
├── roadmap.html         Full index of shipped / in-build / planned projects
├── about.html            Story, timeline, values
├── contact.html          Contact form
├── css/style.css         Design system — colors, type, animations
├── js/main.js            Preloader, scroll reveals, slideshows, lighting effects, contact form logic
└── backend/              Optional API — see backend/README.md
```

## Running just the frontend

Open `index.html` directly in a browser, or serve the folder with any static
server. Everything works except the contact form, which needs the backend
running to actually save/send messages (it fails gracefully otherwise).

## Running the full site (frontend + backend + database)

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI
npm run seed
npm start
```

Then open `http://localhost:3000` — full site, working contact form. See
`backend/README.md` for the full explanation of how the pieces connect.

## Editing project links

Open `js/main.js` and edit the two lines at the top:

```js
window.PROJECT_LINKS = {
  aeo: "#",         // → your real AEO Citation System URL
  talentTrack: "#"  // → your real TalentTrack URL
};
```

Every "View Platform" / "Open" button across all four pages updates
automatically from these two lines.

## Adding your photo

Replace the placeholder in `index.html`:

```html
<!-- find this: -->
<div class="hud-photo">
  <div class="placeholder">TPM</div>
</div>

<!-- replace with: -->
<div class="hud-photo">
  <img src="assets/profile.jpg" alt="Takudzwa P. Matimura">
</div>
```
