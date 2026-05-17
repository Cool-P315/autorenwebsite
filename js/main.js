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
