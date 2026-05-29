/* ============================================================
   main.js — Martin Pintar Autorwebsite
   ============================================================ */

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
    document.body.style.overflow = isOpen ? 'hidden' : '';
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

// --- Active nav link ---
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
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

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

// Kontaktformular absenden
const contactForm = document.querySelector('.form');
if (contactForm) {
  contactForm.addEventListener('submit', function () {
    gcEvent('kontakt/formular-absenden', 'Kontaktformular abgesendet');
  });
}

// --- Leseprobe Modal ---
const allModals = document.querySelectorAll('.modal-backdrop');
const MODAL_FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
let lastFocusedBeforeModal = null;

function openModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (!modal) return;
  lastFocusedBeforeModal = document.activeElement;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Fokus auf das erste fokussierbare Element im Dialog
  const focusables = modal.querySelectorAll(MODAL_FOCUSABLE);
  (focusables[0] || modal).focus();
}

function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
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
    if (e.shiftKey && document.activeElement === first) {
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
  trigger.addEventListener('click', () => {
    const id = trigger.dataset.modal;
    openModal(id);
    gcEvent('leseprobe/' + id, 'Leseprobe: ' + id);
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
  update();
})();

// ============================================================
// FALLING LEAVES (nur Hero-Sektion / Startseite)
// ============================================================
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const glyphs = ['❧', '✦', '❧', '✦', '·', '❧', '✦', '❧', '·', '✦'];
  for (let i = 0; i < 10; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'hero__leaf';
    leaf.setAttribute('aria-hidden', 'true');
    leaf.textContent = glyphs[i];
    leaf.style.setProperty('--leaf-left',     (4  + Math.random() * 92) + '%');
    leaf.style.setProperty('--leaf-delay',    (Math.random() * 14)      + 's');
    leaf.style.setProperty('--leaf-duration', (7  + Math.random() * 9)  + 's');
    leaf.style.setProperty('--leaf-size',     (0.5 + Math.random() * 0.7) + 'rem');
    hero.appendChild(leaf);
  }
})();

// ============================================================
// 3D BOOK COVER TILT (nur Desktop / Pointer-Geräte)
// ============================================================
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.book-teaser__cover-wrap, .book-entry__cover-col').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;

    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      const y = ((e.clientY - r.top)   / r.height - 0.5) * 2;
      img.style.transform  = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 6}deg) translateY(-6px) scale(1.02)`;
      img.style.transition = 'transform 0.1s ease-out';
    });

    wrap.addEventListener('mouseleave', () => {
      img.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
      img.style.transform  = '';
    });
  });
}
