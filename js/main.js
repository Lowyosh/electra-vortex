(function () {
  'use strict';

  /* ── NAV: sticky + mobile toggle ── */
  const nav        = document.getElementById('nav');
  const navToggle  = document.getElementById('navToggle');
  const navMenu    = document.getElementById('navMenu');
  const navLinks   = navMenu.querySelectorAll('.nav__link');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function toggleMenu(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

  /* ── FOOTER YEAR ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── TESTIMONIALS: drag / button scroll ── */
  const track    = document.getElementById('testimonialsTrack');
  const btnPrev  = document.getElementById('testimPrev');
  const btnNext  = document.getElementById('testimNext');

  if (track && btnPrev && btnNext) {
    const scrollBy = () => track.querySelector('.testimonial-card')?.offsetWidth + 24 || 320;

    btnPrev.addEventListener('click', () =>
      track.scrollBy({ left: -scrollBy(), behavior: 'smooth' })
    );
    btnNext.addEventListener('click', () =>
      track.scrollBy({ left: scrollBy(), behavior: 'smooth' })
    );
  }

  /* ── CUSTOM CURSOR + TRAIL ── */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    const TRAIL = 30;
    const dots = [];
    const history = [];
    let mx = 0, my = 0, active = false, started = false;

    for (let i = 0; i < TRAIL; i++) {
      const el = document.createElement('div');
      el.className = 'cursor-trail';
      document.body.appendChild(el);
      dots.push(el);
    }

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx - 10}px, ${my - 12}px)`;
      cursor.classList.add('is-visible');
      active = true;
      if (!started) { renderTrail(); started = true; }
    });
    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      active = false;
    });

    function renderTrail() {
      history.push([mx, my]);
      if (history.length > TRAIL) history.shift();

      dots.forEach((dot, i) => {
        const pos = history[history.length - 1 - i] || history[0];
        const t = 1 - i / TRAIL;
        dot.style.transform = `translate(${pos[0] - 1}px, ${pos[1] - 1}px)`;
        dot.style.opacity = active ? t * 0.65 : 0;
      });

      requestAnimationFrame(renderTrail);
    }
  }

  /* ── CONTACT FORM → WhatsApp ── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.querySelector('#name').value.trim();
      const message = form.querySelector('#message').value.trim();

      const text = `Hola Karla, me llamo ${name}.\n\n${message}`;
      const url  = `https://wa.me/34644401549?text=${encodeURIComponent(text)}`;

      window.open(url, '_blank', 'noopener,noreferrer');
      form.reset();
    });
  }

})();
