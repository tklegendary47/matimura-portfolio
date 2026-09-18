/* =====================================================================
   MATIMURA — Portfolio Interaction Layer (v3)
   Preloader / nav / kinetic reveals / magnetic UI / cinematic parallax
   Powered by GSAP + ScrollTrigger where available, with a plain-JS
   fallback so the site still works if the CDN scripts fail to load.
   v3: rebuilt mobile menu — morphing hamburger, clip-path overlay panel,
   staggered link cascade, backdrop, scroll-lock, ESC/resize-safe.
   Works on every page that includes this file; no per-page JS needed.
   ===================================================================== */

/* ---- CONFIG — edit these two lines with real project URLs when ready ---- */
window.PROJECT_LINKS = {
  aeo: "#",         // e.g. "https://aeocitation.com"
  talentTrack: "#"  // e.g. "https://talenttrack-tpm.netlify.app"
};

/* ---- WHATSAPP — one central contact point for the portfolio ----
   Replace the number below with your active WhatsApp number.
   Use country code only, with no +, spaces, brackets, or dashes.
   The current value matches the WhatsApp CTA already present in
   packages.html, so every portfolio contact point stays consistent. */
window.WHATSAPP_CONFIG = {
  number: '263717549840',
  message: "Hi Takudzwa, I found your portfolio and I'd like to discuss a website project."
};

function initScrollProgress() {
  if (document.querySelector('.scroll-progress')) return;

  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page scroll progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    bar.style.setProperty('--scroll-progress', `${progress}%`);
    bar.style.transform = `scaleX(${progress / 100})`;
    bar.setAttribute('aria-valuenow', String(Math.round(progress)));
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', requestUpdate, { once: true });
  update();
}

function initFloatingWhatsApp() {
  if (document.querySelector('.wa-float')) return;

  const config = window.WHATSAPP_CONFIG || {};
  const number = String(config.number || '').replace(/[^0-9]/g, '');
  if (!number) return;

  const message = encodeURIComponent(
    config.message || "Hi Takudzwa, I'd like to discuss a website project."
  );

  const link = document.createElement('a');
  link.className = 'wa-float';
  link.href = `https://wa.me/${number}?text=${message}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', 'Contact Takudzwa on WhatsApp');
  link.setAttribute('title', 'Chat on WhatsApp');
  link.innerHTML = `
    <span class="wa-float-pulse" aria-hidden="true"></span>
    <span class="wa-float-label" aria-hidden="true">Chat on WhatsApp</span>
    <svg class="wa-float-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 3.8A10.2 10.2 0 0 0 4.3 16.1L3 21l5-1.3A10.2 10.2 0 0 0 20.2 3.8Z"></path>
      <path d="M8.7 7.5c.2-.3.4-.3.7-.3h.5c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4 0 .6l-.6.8c-.1.2-.1.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6 0l.8-.6c.2-.1.4-.1.6 0l1.9.8c.3.1.4.3.4.5v.5c0 .3 0 .5-.3.7-.4.3-1 .5-1.5.5-1.1 0-2.8-.7-4.4-2.2-1.6-1.5-2.4-3.2-2.4-4.3 0-.6.2-1.1.5-1.5Z"></path>
    </svg>
  `;

  document.body.appendChild(link);

  const reveal = () => {
    window.requestAnimationFrame(() => link.classList.add('show'));
  };

  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.setTimeout(reveal, 2350);
  } else {
    window.setTimeout(reveal, 650);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  initScrollProgress();
  initFloatingWhatsApp();

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

  /* ---------------------------------------------------------------
     NAV — scrolled state
     --------------------------------------------------------------- */
  const nav = document.querySelector('.site-nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     MOBILE MENU — v3
     One self-contained system, identical on every page:
       · Morphing hamburger (bars → brass X, two-beat animation)
       · Clip-path "light gate" panel sweep
       · Links cascade in with per-link stagger + blur
       · Backdrop dim + blur, injected automatically (no HTML change)
       · Body scroll-lock, ESC to close, backdrop tap to close,
         auto-close on link tap / resize past breakpoint / page hide
       · aria-expanded state for screen readers
     Expected markup (already in your pages):
       <button class="nav-toggle" aria-label="Menu"><span></span>×3</button>
       <nav class="nav-links"> <a>…</a> … </nav>
     The three bars should sit inside a .bars wrapper if you update the
     HTML (see README note); the CSS handles both flat and wrapped.
     --------------------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const MOBILE_QUERY = window.matchMedia('(max-width: 880px)');

  if (toggle && links) {
    /* --- normalise toggle internals: ensure a .bars wrapper exists so
       the three-bar morph positions identically on every page even if
       a page's HTML has the spans loose or missing one --- */
    let bars = toggle.querySelector('.bars');
    if (!bars) {
      bars = document.createElement('span');
      bars.className = 'bars';
      const spans = Array.from(toggle.querySelectorAll('span'));
      if (spans.length === 3) {
        spans.forEach(s => bars.appendChild(s));
      } else {
        for (let i = 0; i < 3; i++) bars.appendChild(document.createElement('span'));
      }
      toggle.appendChild(bars);
    } else if (bars.children.length !== 3) {
      bars.innerHTML = '<span></span><span></span><span></span>';
    }
    toggle.setAttribute('aria-label', toggle.getAttribute('aria-label') || 'Menu');
    toggle.setAttribute('aria-expanded', 'false');

    /* --- inject backdrop once (keeps HTML untouched) --- */
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    /* --- index each link so CSS can stagger it via --i --- */
    const menuItems = links.querySelectorAll('a');
    menuItems.forEach((a, i) => a.style.setProperty('--i', i));

    const openMenu = () => {
      links.classList.add('open');
      toggle.classList.add('active');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-locked');
    };
    const closeMenu = () => {
      if (!links.classList.contains('open')) return;
      links.classList.remove('open');
      toggle.classList.remove('active');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-locked');
    };
    const menuIsOpen = () => links.classList.contains('open');

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuIsOpen() ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    menuItems.forEach(a => a.addEventListener('click', closeMenu));

    /* ESC key — always works, even if focus lands inside the panel */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuIsOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    /* Rotate to landscape / grow past breakpoint → never leave a
       half-open panel stranded */
    const onViewportChange = () => { if (!MOBILE_QUERY.matches) closeMenu(); };
    if (MOBILE_QUERY.addEventListener) {
      MOBILE_QUERY.addEventListener('change', onViewportChange);
    } else {
      MOBILE_QUERY.addListener(onViewportChange); // legacy Safari
    }

    /* Safety nets: navigating away (bfcache) or app switching must
       never restore a locked, open menu */
    window.addEventListener('pagehide', closeMenu);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) closeMenu();
    });
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
          gsap.delayedCall(i * 0.04, () => {
            el.classList.add('in');
            if (el.classList.contains('light-sweep')) el.classList.add('sweep-run');
            if (el.classList.contains('pcard')) {
              const media = el.querySelector('.pcard-media');
              if (media) gsap.delayedCall(1.45, () => {
                media.style.transitionProperty = 'none';
                media.classList.add('tilt-ready');
              });
            }
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
      if (!match) return; // non-numeric values stay static
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
     tied to scroll position, smoothed with GSAP quickTo.
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

  /* ---------------- Per-card spotlight glow ---------------- */
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

  /* ---------------- Atmosphere orb parallax ---------------- */
  const orbs = document.querySelectorAll('.orb');
  if (orbs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        orb.style.marginTop = `${y * (0.04 + i * 0.02) * -1}px`;
      });
    }, { passive: true });
  }

  /* ---------------- Marquee — briefly speeds up on scroll ---------------- */
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
