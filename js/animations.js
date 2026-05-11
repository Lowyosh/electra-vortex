/* ── Registro de plugins ── */
gsap.registerPlugin(ScrollTrigger);

/* ── Lenis smooth scroll + integración con GSAP ticker ── */
const lenis = new Lenis({
  duration: 0.9,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  touchMultiplier: 1.5,
  smoothTouch: false,   // nativo en móvil es más rápido
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add(() => lenis.raf(performance.now()));
gsap.ticker.lagSmoothing(0);

/* ── Splitter de letras (sin dependencias externas) ── */
function makeChar(ch) {
  const s = document.createElement('span');
  s.className = 'char';
  // ' ' evita que inline-block colapse el espacio en blanco
  s.textContent = ch === ' ' ? ' ' : ch;
  return s;
}

function splitChars(el) {
  const nodes = [...el.childNodes];
  el.innerHTML = '';
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim()) return;
      [...node.textContent.trim()].forEach((ch) => el.appendChild(makeChar(ch)));
    } else if (node.nodeName === 'EM') {
      const em = document.createElement('em');
      [...node.textContent].forEach((ch) => em.appendChild(makeChar(ch)));
      el.appendChild(em);
    } else if (node.nodeName === 'BR') {
      el.appendChild(document.createElement('br'));
    }
  });
}

/* ── Hero entrance timeline ── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  splitChars(document.querySelector('.hero__title'));

  gsap.set(['.hero__eyebrow', '.hero__subtitle', '.hero__actions .btn'], { autoAlpha: 0 });

  // t=0.00  eyebrow    fade + sube                0.00 → 1.00s
  // t=0.50  chars      letra a letra              0.50 → 2.00s  (stagger.amount 0.9 + dur 0.6)
  // t=1.40  subtítulo  fade + sube                1.40 → 2.40s  (-=0.60)
  // t=1.65  botones    scale + fade stagger 0.15  1.65 → 2.60s  (-=0.75)
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.hero__eyebrow',
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 1.0 }
    )
    .from('.hero__title .char',
      { autoAlpha: 0, y: 18, duration: 0.6, stagger: { amount: 0.9 } },
      '-=0.5'
    )
    .fromTo('.hero__subtitle',
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 1.0 },
      '-=0.6'
    )
    .fromTo('.hero__actions .btn',
      { autoAlpha: 0, scale: 0.88 },
      { autoAlpha: 1, scale: 1, duration: 0.8, stagger: 0.15 },
      '-=0.75'
    );
})();

/* ── Reveals con ScrollTrigger (excluye el hero) ── */
gsap.utils.toArray('.reveal')
  .filter((el) => !el.closest('.hero'))
  .forEach((el) => {
    const delay = el.classList.contains('reveal--delay-3') ? 0.32
                : el.classList.contains('reveal--delay-2') ? 0.20
                : el.classList.contains('reveal--delay-1') ? 0.10
                : 0;

    gsap.fromTo(el,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

/* ── Service cards: fade-up staggered como grupo ── */
gsap.fromTo('.service-card',
  { autoAlpha: 0, y: 50 },
  {
    autoAlpha: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.18,
    scrollTrigger: {
      trigger: '.services__grid',
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  }
);

/* ── About: parallax imagen + fade-in independientes ── */
// Fade-in: solo opacity, sin y — para no pelear con el parallax
gsap.fromTo('.about__image-wrap',
  { autoAlpha: 0 },
  {
    autoAlpha: 1,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about__image-wrap',
      start: 'top 85%',
    },
  }
);

// Parallax: y scrubbed — imagen sube más lento que el scroll
gsap.to('.about__image-wrap', {
  y: -120,
  ease: 'none',
  scrollTrigger: {
    trigger: '.about',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
  },
});

/* ── Refresh ScrollTrigger tras carga de fuentes ── */
// Cormorant Garamond carga de forma asíncrona; cuando llega, el navegador
// recalcula el layout y los trigger points quedan desalineados sin este refresh.
document.fonts.ready.then(() => ScrollTrigger.refresh());

/* ── Canvas partículas hero (usa gsap.ticker, no rAF propio) ── */
(function () {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COUNT = window.innerWidth < 600 ? 40 : 80;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const COLORS = [
    [174, 122, 166],   // morado normal  #AE7AA6
    [252, 236, 248],   // morado clarito #FCECF8
    [240, 193, 112],   // dorado         #F0C170
  ];

  function createParticles() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.5 + 0.15,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  function drawTick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${p.a})`;
      ctx.fill();
    });
  }

  resize();
  createParticles();

  // Un único rAF compartido con GSAP/Lenis
  gsap.ticker.add(drawTick);

  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });
})();
