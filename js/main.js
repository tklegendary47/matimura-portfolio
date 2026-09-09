/* =====================================================================
   MATIMURA — Portfolio Interaction Layer (v2)
   Preloader / nav / kinetic reveals / magnetic UI / cinematic parallax
   Powered by GSAP + ScrollTrigger where available, with a plain-JS
   fallback so the site still works if the CDN scripts fail to load.
   ===================================================================== */

/* ---- CONFIG — edit these two lines with real project URLs when ready ---- */
window.PROJECT_LINKS = {
  aeo: "#",         // e.g. "https://aeocitation.com"
  talentTrack: "#"  // e.g. "https://talenttrack-tpm.netlify.app"
};

document.addEventListener('DOMContentLoaded', () => {

  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer:fine)').matches; // has a real mouse (not touch)

  /* ---------------------------------------------------------------
     PRELOADER — letter-in mark, animated percentage, curtain exit
     --------------------------------------------------------------- */
  const preMark = document.querySelector('.pre-mark');
  if (preMark) {
    const word = preMark.dataset.word || 'MATIMURA';
    preMark.innerHTML = word.split('').map((ch, i) =>
      `<span style="animation-delay:${0.05 * i}s">${ch}</span>`
    ).join('');
  }
  const preloader = document.getElementById('preloader');
  if (preloader) {
    document.body.style.overflow = 'hidden';
    const percentEl = preloader.querySelector('.pre-percent');

    if (hasGSAP && !reduceMotion) {
      const counter = { v: 0 };
      gsap.to(counter, {
        v: 100, duration: 1.7, delay: 0.15, ease: 'power2.inOut',
        onUpdate: () => { if (percentEl) percentEl.textContent = String(Math.round(counter.v)).padStart(2, '0') + '%'; }
      });
      gsap.timeline({ delay: 2.0 })
        .to(preloader, { yPercent: -100, duration: 1.1, ease: 'power4.inOut' })
        .set(preloader, { display: 'none' })
        .call(() => { document.body.style.overflow = ''; ScrollTrigger.refresh(); });
    } else {
      if (percentEl) percentEl.textContent = '100%';
      window.setTimeout(() => {
        preloader.classList.add('hide');
        document.body.style.overflow = '';
      }, 2100);
    }
  }

  /* ---------------- Nav: scrolled state + mobile toggle ---------------- */
  const nav = document.querySelector('.site-nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---------------------------------------------------------------
     KINETIC WORD-SPLIT — section titles + page-hero h1s reveal
     word-by-word with a blur-and-rise, triggered on scroll.
     --------------------------------------------------------------- */
  const kineticTargets = document.querySelectorAll('.section-title, .page-hero h1');
  kineticTargets.forEach(el => {
    if (el.children.length > 0) return; // don't touch titles with embedded markup
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="kw-wrap"><span class="kw">${w}</span></span>`).join(' ');
  });

  if (hasGSAP) {
    kineticTargets.forEach(el => {
      const words = el.querySelectorAll('.kw');
      if (!words.length) return;
      gsap.set(words, { yPercent: 115, opacity: 0, filter: 'blur(8px)' });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.to(words, {
          yPercent: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.6, stagger: 0.026, ease: 'expo.out'
        })
      });
    });
  }

  /* ---------------------------------------------------------------
     SCROLL REVEALS — grouped/staggered via ScrollTrigger.batch,
     falls back to IntersectionObserver if GSAP failed to load.
     --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal, .pcard, .twist-card, .vcard, .info-card');

  if (hasGSAP) {
    ScrollTrigger.batch(revealEls, {
      start: 'top 91%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((el, i) => {
          // gsap.delayedCall runs on GSAP's own rAF ticker, so a whole batch
          // stays frame-locked together instead of drifting the way stacked
          // setTimeouts can under load — the stagger reads as one fluid wave.
          gsap.delayedCall(i * 0.04, () => {
            el.classList.add('in');
            if (el.classList.contains('light-sweep')) el.classList.add('sweep-run');
            // Once a project card's one-time 3D flip-in finishes, hand its
            // media panel fully over to GSAP for the continuous scroll-tilt
            // below — otherwise the CSS transition keeps re-smoothing every
            // GSAP-driven frame and the tilt feels sluggish instead of crisp.
            if (el.classList.contains('pcard')) {
              const media = el.querySelector('.pcard-media');
              // 1.15s transform transition + 0.05s delay = 1.2s to fully settle;
              // wait a beat longer so the handoff never clips the tail of the flip.
              if (media) gsap.delayedCall(1.45, () => {
                media.style.transitionProperty = 'none';
                media.classList.add('tilt-ready'); // only now is it safe for the scroll-tilt below to touch its transform
              });
            }
            // Roadmap twist-cards share one transition rule between their
            // slow, smooth entrance flip and their snappy hover tilt. Once
            // the entrance settles, swap to a fast duration so hover feels
            // immediate instead of dragging out over a second.
            if (el.classList.contains('twist-card')) {
              gsap.delayedCall(1.2, () => { el.style.setProperty('--tw-dur', '0.35s'); });
            }
          });
        });
      }
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.classList.contains('light-sweep')) entry.target.classList.add('sweep-run');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------
     COUNT-UP STATS — hero-meta / pcard-stats numbers animate up
     from 0 the first time they scroll into view.
     --------------------------------------------------------------- */
  if (hasGSAP && !reduceMotion) {
    document.querySelectorAll('.hero-meta .n, .pcard-stats .n').forEach(el => {
      const raw = el.textContent.trim();
      const match = raw.match(/^([\d]+(?:\.\d+)?)(.*)$/);
      if (!match) return; // non-numeric values (e.g. "A-", "Full-Stack") stay static
      const target = parseFloat(match[1]);
      const suffix = match[2];
      const isDecimal = match[1].includes('.');
      const padLen = (!isDecimal && match[1].length > 1 && match[1].startsWith('0')) ? match[1].length : 0;
      const counter = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 94%', once: true,
        onEnter: () => gsap.to(counter, {
          v: target, duration: 0.85, ease: 'power2.out',
          onUpdate: () => {
            const whole = isDecimal ? counter.v.toFixed(1) : String(Math.round(counter.v)).padStart(padLen, '0');
            el.textContent = whole + suffix;
          }
        })
      });
    });
  }

  /* ---------------------------------------------------------------
     MAGNETIC BUTTONS — CTAs and links gently pull toward the cursor.
     --------------------------------------------------------------- */
  if (hasGSAP && !reduceMotion && fine) {
    document.querySelectorAll('.btn, .nav-cta, .pcard-link, .vcard-link, .tcard-link').forEach(btn => {
      const isBig = btn.classList.contains('btn') || btn.classList.contains('nav-cta');
      const strength = isBig ? 0.35 : 0.22;
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.55, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.55, ease: 'power3.out' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width / 2;
        const relY = e.clientY - r.top - r.height / 2;
        xTo(relX * strength);
        yTo(relY * strength - (isBig ? 3 : 0));
      });
      btn.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------------------------------------------------------------
     Scroll-linked 3D twist on project cards — continuous rotateY
     tied to scroll position, smoothed with GSAP quickTo so it
     glides instead of snapping frame to frame.
     --------------------------------------------------------------- */
  const tiltMedia = document.querySelectorAll('.pcard-media');
  if (tiltMedia.length && !reduceMotion) {
    const setters = new Map();
    tiltMedia.forEach(el => {
      setters.set(el, hasGSAP
        ? gsap.quickTo(el, 'rotateY', { duration: 0.65, ease: 'power3.out' })
        : (deg) => { el.style.transform = `rotateY(${deg}deg) scale(1)`; }
      );
    });
    let ticking = false;
    const updateTilt = () => {
      const vh = window.innerHeight;
      tiltMedia.forEach(el => {
        const card = el.closest('.pcard');
        // Gate on 'tilt-ready', not just 'in' — 'in' fires the instant the
        // entrance flip *starts*. If this scroll-tilt also touched the
        // element's transform while that 1.15s CSS transition was still
        // running, the two would fight every frame and the flip would read
        // as janky instead of clean. 'tilt-ready' is only added once the
        // entrance transition has fully finished and handed the transform off.
        if (!card || !card.classList.contains('in') || !el.classList.contains('tilt-ready')) return;
        const rect = el.getBoundingClientRect();
        const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
        const rotate = Math.max(-10, Math.min(10, centerOffset * -14));
        setters.get(el)(rotate);
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateTilt); ticking = true; }
    }, { passive: true });
    updateTilt();
  }

  /* ---------------------------------------------------------------
     CURSOR SPOTLIGHT — smoothed with GSAP quickTo for a buttery,
     lagging-light feel instead of snapping straight to the cursor.
     --------------------------------------------------------------- */
  const spotlight = document.querySelector('.spotlight');
  if (spotlight) {
    if (hasGSAP && !reduceMotion && fine) {
      const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const setX = gsap.quickTo(pos, 'x', { duration: 0.4, ease: 'power3.out', onUpdate: () => spotlight.style.setProperty('--sx', pos.x + 'px') });
      const setY = gsap.quickTo(pos, 'y', { duration: 0.4, ease: 'power3.out', onUpdate: () => spotlight.style.setProperty('--sy', pos.y + 'px') });
      window.addEventListener('pointermove', (e) => {
        setX(e.clientX); setY(e.clientY);
        spotlight.classList.add('active');
      }, { passive: true });
      window.addEventListener('pointerleave', () => spotlight.classList.remove('active'));
    } else {
      window.addEventListener('pointermove', (e) => {
        spotlight.style.setProperty('--sx', `${e.clientX}px`);
        spotlight.style.setProperty('--sy', `${e.clientY}px`);
        spotlight.classList.add('active');
      }, { passive: true });
      window.addEventListener('pointerleave', () => spotlight.classList.remove('active'));
    }
  }

  /* ---------------- Per-card spotlight glow (twist cards + project cards) ----------------
     Uses a plain proxy object (not the CSS var directly) so GSAP's easing
     doesn't strip the "px" unit the gradient position needs. */
  document.querySelectorAll('.tcard-inner, .pcard-body').forEach(card => {
    if (hasGSAP && !reduceMotion && fine) {
      const pos = { x: 0, y: 0 };
      const setMX = gsap.quickTo(pos, 'x', { duration: 0.3, ease: 'power2.out', onUpdate: () => card.style.setProperty('--mx', pos.x + 'px') });
      const setMY = gsap.quickTo(pos, 'y', { duration: 0.3, ease: 'power2.out', onUpdate: () => card.style.setProperty('--my', pos.y + 'px') });
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        setMX(e.clientX - rect.left);
        setMY(e.clientY - rect.top);
      });
    } else {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    }
  });

  /* ---------------- Atmosphere orb parallax (drift responds to scroll) ---------------- */
  const orbs = document.querySelectorAll('.orb');
  if (orbs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        orb.style.marginTop = `${y * (0.04 + i * 0.02) * -1}px`;
      });
    }, { passive: true });
  }

  /* ---------------- Marquee — briefly speeds up on scroll for a lively feel ---------------- */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack && !reduceMotion) {
    let mqTimer = null;
    window.addEventListener('scroll', () => {
      marqueeTrack.style.animationDuration = '10s';
      clearTimeout(mqTimer);
      mqTimer = setTimeout(() => { marqueeTrack.style.animationDuration = ''; }, 500);
    }, { passive: true });
  }

  /* Cinematic slideshows (project cards + image strip) */
  document.querySelectorAll('.slideshow, .strip-cell').forEach(container => {
    const imgs = container.querySelectorAll('img');
    if (imgs.length < 2) { if (imgs[0]) imgs[0].classList.add('active'); return; }
    let idx = 0;
    imgs[0].classList.add('active');
    const interval = 4200 + Math.random() * 800;
    setInterval(() => {
      imgs[idx].classList.remove('active');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('active');
    }, interval);
  });

  /* Hero parallax (subtle, mouse + scroll), smoothed with quickTo */
  const hud = document.querySelector('.hud');
  const heroGrid = document.querySelector('.hero-grid');
  if (hud && fine) {
    if (hasGSAP && !reduceMotion) {
      const hx = gsap.quickTo(hud, 'x', { duration: 0.7, ease: 'power3.out' });
      const hy = gsap.quickTo(hud, 'y', { duration: 0.7, ease: 'power3.out' });
      window.addEventListener('pointermove', (e) => {
        hx((e.clientX / window.innerWidth - 0.5) * 14);
        hy((e.clientY / window.innerHeight - 0.5) * 14);
      }, { passive: true });
    } else {
      window.addEventListener('pointermove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 14;
        const y = (e.clientY / window.innerHeight - 0.5) * 14;
        hud.style.transform = `translate(${x}px, ${y}px)`;
      }, { passive: true });
    }
  }
  window.addEventListener('scroll', () => {
    if (heroGrid) {
      const y = window.scrollY * 0.25;
      heroGrid.style.transform = `translateY(${y}px)`;
    }
  }, { passive: true });

  /* ---------------- Contact form — posts to Formspree ----------------
     Formspree is a hosted form backend: no server of your own required.
     1. Create a form at https://formspree.io (free tier: ~50 submissions/month)
     2. Copy the endpoint it gives you (looks like https://formspree.io/f/xxxxxxxx)
     3. Paste it below, replacing FORMSPREE_ENDPOINT.
     Until you do that, this fails quietly to a friendly message instead of breaking. */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnpqlbaa';

  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const original = btn.textContent;

      btn.textContent = 'Sending…';
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error('Request failed');

        btn.textContent = 'Message sent';
        btn.style.background = 'var(--teal)';
        form.reset();
      } catch (err) {
        btn.textContent = 'Could not send — try WhatsApp instead';
        btn.style.background = 'var(--line)';
        console.warn('[contact] Formspree request failed. Confirm FORMSPREE_ENDPOINT in main.js is set to your real form ID.');
      } finally {
        setTimeout(() => { btn.textContent = original; btn.style.background = ''; }, 3600);
      }
    });
  }

});

