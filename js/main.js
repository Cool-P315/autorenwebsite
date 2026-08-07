/* ============================================================
   main.js — Martin Pintar Autorwebsite
   ============================================================ */


// --- Scroll-Lock (Nav + Modal teilen body.overflow; Zähler verhindert Konflikte) ---
let bodyScrollLocks = 0;
function lockBodyScroll() {
  bodyScrollLocks += 1;
  document.body.style.overflow = 'hidden';
}
function unlockBodyScroll() {
  bodyScrollLocks = Math.max(0, bodyScrollLocks - 1);
  if (bodyScrollLocks === 0) document.body.style.overflow = '';
}

// --- Navigation: transparent → dark on scroll ---
const nav = document.querySelector('.nav');

if (nav) {
  if (!nav.classList.contains('nav--always-dark')) {
    const updateNav = () => {
      nav.classList.toggle('scrolled', window.scrollY > 70);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }
}

// --- Mobile nav toggle ---
const navToggle = document.querySelector('.nav__toggle');
const navLinks  = document.querySelector('.nav__links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    if (isOpen) lockBodyScroll(); else unlockBodyScroll();
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        unlockBodyScroll();
      }
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      unlockBodyScroll();
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  // Fokus-Falle: Tab bleibt im geöffneten Vollbild-Menü (analog zum Leseprobe-Modal)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !navLinks.classList.contains('open')) return;
    const focusables = Array.from(nav.querySelectorAll('a[href], button:not([disabled])'))
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (!nav.contains(document.activeElement)) {
      e.preventDefault(); first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

// --- Active nav link ---
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  const href = link.getAttribute('href');
  // "/" bzw. "/index.html" zeigen auf die Startseite; führenden Slash normalisieren
  const target = (href === '/' || href === '/index.html')
    ? 'index.html'
    : href.replace(/^\//, '');
  if (target === currentPage) {
    link.classList.add('active');
  }
});

// --- Intersection Observer: fade-in on scroll ---
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .book-teaser').forEach(el => {
  observer.observe(el);
});

// Anker-Navigation: smooth nur beim Klick (Skip-Link, #main, …).
// Global CSS scroll-behavior: smooth macht Touchpad/Wheel zu schnell/ungezielt.
// Fokus nach Scroll mit preventScroll — sonst springt der Skip-Link-Fokus nicht.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const id = decodeURIComponent(href.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', href);
  });
});

// --- GoatCounter Event Tracking ---
function gcEvent(path, title) {
  if (typeof window.goatcounter === 'undefined' || !window.goatcounter.count) return;
  window.goatcounter.count({ path: 'event/' + path, title: title, event: true });
}

// Amazon-Kaufbuttons
document.querySelectorAll('.book-entry__links a').forEach(link => {
  link.addEventListener('click', function () {
    const book   = this.closest('article')?.querySelector('.book-entry__title')?.textContent.trim() || 'unbekannt';
    const format = this.textContent.trim();
    gcEvent('amazon-kauf/' + book + '/' + format, 'Amazon: ' + format + ' — ' + book);
  });
});

// Rezensions-Links
document.querySelectorAll('.book-entry__review-link').forEach(link => {
  link.addEventListener('click', function () {
    const book = this.closest('article')?.querySelector('.book-entry__title')?.textContent.trim() || 'unbekannt';
    gcEvent('rezension/' + book, 'Rezension: ' + book);
  });
});

// KI-Audio auf der Startseite: erstes Abspielen zählen (einmal pro Seitenaufruf)
const audioGespraech = document.getElementById('audio-kreislauf');
if (audioGespraech) {
  audioGespraech.addEventListener('play', () => {
    gcEvent('audio/der-ewige-kreislauf-von-blatt-und-wind', 'Audio: Der ewige Kreislauf von Blatt und Wind');
  }, { once: true });
}

// Autorenvideo (Über mich): erstes Abspielen zählen (einmal pro Seitenaufruf)
const videoMartinSchreiben = document.getElementById('video-martin-schreiben');
if (videoMartinSchreiben) {
  videoMartinSchreiben.addEventListener('play', () => {
    gcEvent('video/martin-schreiben', 'Video: Martin Schreibmoment');
  }, { once: true });
}

// Startseiten-Teaser zum Autorenvideo
document.querySelectorAll('a.video-teaser').forEach(link => {
  link.addEventListener('click', () => {
    gcEvent('video/teaser-klick', 'Video-Teaser: Schreibmoment');
  });
});

// Amazon-Kaufbuttons in den Leseprobe-Modals. Format-Zusatz "Leseprobe-Modal":
// zählt in den Amazon-Kauf-KPIs mit, bleibt aber von den Format-Buttons unterscheidbar.
document.querySelectorAll('.modal-backdrop').forEach(modal => {
  const link = modal.querySelector('.modal__footer a.btn');
  if (!link) return;
  link.addEventListener('click', () => {
    const book = modal.querySelector('.modal__title')?.textContent.trim() || 'unbekannt';
    gcEvent('amazon-kauf/' + book + '/Leseprobe-Modal', 'Amazon: Leseprobe-Modal — ' + book);
  });
});

// Amazon-Autorenseite: CTA am Seitenende + Footer-Icon. Eigene Kategorie
// "autorenseite" (ohne amazon-Präfix), damit die Kauf-KPIs unverfälscht bleiben.
const pageSlug = currentPage.replace('.html', '') || 'index';
document.querySelectorAll('.amazon-cta a.btn').forEach(link => {
  link.addEventListener('click', () => {
    gcEvent('autorenseite/cta-' + pageSlug, 'Amazon-Autorenseite: CTA ' + pageSlug);
  });
});
document.querySelectorAll('.footer__amazon-link').forEach(link => {
  link.addEventListener('click', () => {
    gcEvent('autorenseite/footer-' + pageSlug, 'Amazon-Autorenseite: Footer ' + pageSlug);
  });
});

// Kontaktformular absenden
const contactForm = document.querySelector('.form');
if (contactForm) {
  contactForm.addEventListener('submit', function () {
    // Honeypot-Feld ("_gotcha") ist fuer Menschen unsichtbar — nur Bots fuellen es aus.
    // Formspree verwirft die Nachricht dann serverseitig, wir tracken es nur separat.
    const honeypot = this.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      gcEvent('kontakt/bot-abgewehrt', 'Bot abgewehrt (Honeypot)');
    } else {
      gcEvent('kontakt/formular-absenden', 'Kontaktformular abgesendet');
    }
  });
}

// --- Leseprobe Modal ---
const allModals = document.querySelectorAll('.modal-backdrop');
const MODAL_FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
let lastFocusedBeforeModal = null;

// Atmosphären-Video im Modal-Kopf (reduced-motion: Hero ist per CSS ausgeblendet)
function startModalHero(modal) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = modal.querySelector('.modal__hero');
  if (!hero) return;
  const video = hero.querySelector('video');
  if (!video) return;
  if (!video.getAttribute('src')) {
    video.src = hero.dataset.heroVideo;
    video.load();
  }
  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => { /* Autoplay blockiert → Standbild */ });
  }
}

function stopModalHero(modal) {
  const video = modal.querySelector('.modal__hero video');
  if (video) video.pause();
}

function openModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  lastFocusedBeforeModal = document.activeElement;
  modal.classList.add('open');
  lockBodyScroll();
  startModalHero(modal);
  // Fokus auf den Dialog selbst, nicht auf "Schliessen" — Screenreader
  // lesen dadurch zuerst Label und Buchtitel statt der Abbruch-Aktion.
  const dialog = modal.querySelector('.modal');
  if (dialog) {
    dialog.setAttribute('tabindex', '-1');
    dialog.focus();
  } else {
    (modal.querySelectorAll(MODAL_FOCUSABLE)[0] || modal).focus();
  }
}

function closeModal(modal) {
  modal.classList.remove('open');
  unlockBodyScroll();
  stopModalHero(modal);
  // Fokus zurück auf das auslösende Element
  if (lastFocusedBeforeModal) {
    lastFocusedBeforeModal.focus();
    lastFocusedBeforeModal = null;
  }
}

allModals.forEach(modal => {
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
  const btn = modal.querySelector('.modal__close');
  if (btn) btn.addEventListener('click', () => closeModal(modal));

  // Focus-Trap: Tabulator innerhalb des offenen Dialogs halten
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(modal.querySelectorAll(MODAL_FOCUSABLE))
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (!focusables.includes(document.activeElement)) {
      // Fokus liegt auf dem Dialog-Container selbst (nach dem Oeffnen)
      e.preventDefault(); (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    allModals.forEach(m => { if (m.classList.contains('open')) closeModal(m); });
  }
});

document.querySelectorAll('[data-modal]').forEach(trigger => {
  const activate = () => {
    const id = trigger.dataset.modal;
    openModal(id);
    gcEvent('leseprobe/' + id, 'Leseprobe: ' + id);
  };
  trigger.addEventListener('click', activate);
  // role="button"-Divs feuern bei Enter/Leertaste kein click-Event
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });
});

// --- Dark Mode Toggle ---
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mp-theme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus');
  }
}

if (themeToggle) {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  themeToggle.setAttribute('aria-label', current === 'dark' ? 'Heller Modus' : 'Dunkler Modus');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  });
}

// OS-Präferenz live mitlesen (nur ohne manuelle Speicherung)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('mp-theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});

// --- Web Share API ---
document.querySelectorAll('.share-btn').forEach(btn => {
  const url   = btn.dataset.shareUrl;
  const title = btn.dataset.shareTitle;
  const text  = btn.dataset.shareText;

  btn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        gcEvent('share/' + title, 'Geteilt: ' + title);
      } catch (e) {
        // Abgebrochen vom Nutzer — kein Fehler
      }
    } else {
      // Fallback: Dropdown mit "Link kopieren"
      const fallbackId = 'share-fallback-' + btn.closest('article')?.id;
      const fallback   = document.getElementById(fallbackId);
      if (fallback) {
        const isHidden = fallback.hidden;
        document.querySelectorAll('.share-fallback').forEach(f => { f.hidden = true; });
        fallback.hidden = !isHidden;
      }
    }
  });
});

document.querySelectorAll('.share-copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const url     = btn.dataset.url;
    const copied  = btn.nextElementSibling;
    try {
      await navigator.clipboard.writeText(url);
      const book = btn.closest('article')?.querySelector('.book-entry__title')?.textContent.trim() || 'unbekannt';
      gcEvent('share/' + book, 'Geteilt (Link kopiert): ' + book);
      if (copied) {
        copied.hidden = false;
        setTimeout(() => { copied.hidden = true; }, 2000);
      }
    } catch (e) {
      // Clipboard nicht verfügbar — stumm scheitern
    }
  });
});

// Fallback schließen bei Klick außerhalb
document.addEventListener('click', e => {
  if (!e.target.closest('.book-entry__share')) {
    document.querySelectorAll('.share-fallback').forEach(f => { f.hidden = true; });
  }
});

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// ============================================================
// FALLING LEAVES (nur Hero-Sektion / Startseite)
// ============================================================
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Herbstblatt-Silhouette, dem Szenentrenner-Ornament aus dem Buch
  // "Ein Herbstblatt im Wind" nachempfunden; zwei Punkte bleiben als Staub.
  const LEAF_SVG =
    '<svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="currentColor" d="M3 22 C4 15 10 9 20 9 C21 9 21.5 9.5 21.1 10.5 C18.4 17 11.5 22 4.6 22.5 C3.9 22.5 3.2 22.3 3 22 Z"/>' +
    '<path fill="currentColor" d="M24.8 13 C26.3 11.4 28.5 10.8 30.2 11.2 C29.6 13.1 27.7 14.3 25.5 14.3 C25.1 14.3 24.8 13.8 24.8 13 Z"/>' +
    '<path d="M22 11.4 C24 14.2 26.3 16.8 28 20.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
    '</svg>';
  const staub = new Set([4, 8]);
  let blattNr = 0;
  for (let i = 0; i < 10; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'hero__leaf';
    leaf.setAttribute('aria-hidden', 'true');
    if (staub.has(i)) {
      leaf.textContent = '·';
    } else {
      leaf.innerHTML = LEAF_SVG;
      if (blattNr++ % 2) leaf.classList.add('hero__leaf--flip');
    }
    leaf.style.setProperty('--leaf-left',     (4  + Math.random() * 92) + '%');
    leaf.style.setProperty('--leaf-delay',    (Math.random() * 14)      + 's');
    leaf.style.setProperty('--leaf-duration', (7  + Math.random() * 9)  + 's');
    leaf.style.setProperty('--leaf-size',     (0.5 + Math.random() * 0.7) + 'rem');
    hero.appendChild(leaf);
  }
})();

// ============================================================
// REVIEW SLIDER
// ============================================================
document.querySelectorAll('.review-slider').forEach(slider => {
  const slides = slider.querySelectorAll('.review-slider__slide');
  const dots   = slider.querySelectorAll('.review-slider__dot');

  function goTo(idx) {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
});

// ============================================================
// COVER-VIDEOS: 3s Titel-Cover, dann Video endlos (Loop);
// Titel bleibt via .book-cover-title-Overlay durchgehend stehen.
// Viewport-Start; reduced-motion = nur Standbild; Tilt bleibt
// ============================================================
(function initCoverVideos() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COVER_MS = 3000;
  const wraps = document.querySelectorAll('[data-cover-video]');
  if (!wraps.length) return;

  function ensureSrc(wrap, video) {
    const src = wrap.getAttribute('data-cover-video');
    if (src && !video.getAttribute('src')) {
      video.src = src;
      video.load();
    }
  }

  function showCover(media, video) {
    media.classList.remove('is-playing');
    video.pause();
  }

  function showVideo(media, video) {
    try { video.currentTime = 0; } catch (_) { /* ignore */ }
    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt
        .then(() => { media.classList.add('is-playing'); })
        .catch(() => { /* Autoplay blockiert → Cover bleibt */ });
    } else {
      media.classList.add('is-playing');
    }
  }

  function startCycle(wrap) {
    if (wrap._coverCycleId) return;
    const video = wrap.querySelector('video.book-cover-video');
    const media = wrap.querySelector('.book-cover-media');
    if (!video || !media) return;

    ensureSrc(wrap, video);
    showCover(media, video);
    wrap._coverCycleId = setTimeout(() => {
      showVideo(media, video);
    }, COVER_MS);
  }

  function stopCycle(wrap) {
    if (wrap._coverCycleId) {
      clearTimeout(wrap._coverCycleId);
      wrap._coverCycleId = null;
    }
    const video = wrap.querySelector('video.book-cover-video');
    const media = wrap.querySelector('.book-cover-media');
    if (video) video.pause();
    if (media) media.classList.remove('is-playing');
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startCycle(entry.target);
      else stopCycle(entry.target);
    });
  }, { rootMargin: '80px 0px', threshold: 0.2 });

  wraps.forEach(wrap => io.observe(wrap));
})();

// ============================================================
// 3D BOOK COVER TILT (nur Desktop / Pointer-Geräte)
// Ziel: .book-cover-media (Video+Poster gemeinsam), sonst img
// ============================================================
if (window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.book-teaser__cover-wrap, .book-entry__cover-col').forEach(wrap => {
    const target = wrap.querySelector('.book-cover-media') || wrap.querySelector('img');
    if (!target) return;

    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      const y = ((e.clientY - r.top)   / r.height - 0.5) * 2;
      target.style.transform  = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 6}deg) translateY(-6px) scale(1.02)`;
      target.style.transition = 'transform 0.1s ease-out';
    });

    wrap.addEventListener('mouseleave', () => {
      target.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
      target.style.transform  = '';
    });
  });
}

// ============================================================
// TAGLINE-ROTATION (nur Hero / Startseite)
// ============================================================
(function () {
  const lines = document.querySelectorAll('.hero__tagline span');
  if (lines.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let current = 0;
  setInterval(() => {
    lines[current].classList.remove('is-visible');
    lines[current].setAttribute('aria-hidden', 'true');
    current = (current + 1) % lines.length;
    lines[current].classList.add('is-visible');
    lines[current].removeAttribute('aria-hidden');
  }, 12000); // 10 s voll sichtbar + 2 s Crossfade
})();
