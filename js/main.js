/* ============================================================
   EME GUILD — main.js
   Navigation, scroll reveal, background particles, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileNav();
  initActiveSection();
  initScrollReveal();
  initParticles();
  initRules();
});

/* ---------- Nav background on scroll ---------- */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile hamburger menu ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Highlight active section in nav ---------- */
function initActiveSection() {
  const sections = document.querySelectorAll('main [id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  navLinks.forEach((link) => map.set(link.getAttribute('href').slice(1), link));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Lightweight background particles ---------- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;
  const COUNT = window.innerWidth < 700 ? 22 : 42;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height + height * 0.2,
      r: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(61, 220, 132, ${p.alpha})`;
      ctx.shadowColor = 'rgba(61, 220, 132, 0.6)';
      ctx.shadowBlur = 4;
      ctx.fillRect(p.x, p.y, p.r * 2, p.r * 2);
    });
    requestAnimationFrame(tick);
  }

  init();
  window.addEventListener('resize', () => {
    clearTimeout(window.__resizeT);
    window.__resizeT = setTimeout(init, 200);
  });
  requestAnimationFrame(tick);
}

/* ---------- Expandable rule panels ---------- */
function initRules() {
  const triggers = document.querySelectorAll('.rule-trigger');
  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.rule-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.rule-item.open').forEach((el) => {
        if (el !== item) el.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });
}
