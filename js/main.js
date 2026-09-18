(function () {
  window.EME = window.EME || {};
  window.EME.rootPath = document.documentElement.dataset.root || './';

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const hide = () => loader.classList.add('is-hidden');

    const minDelay = new Promise((res) => setTimeout(res, 700));
    const pageReady = new Promise((res) => {
      if (document.readyState === 'complete') res();
      else window.addEventListener('load', res, { once: true });
    });

    Promise.all([minDelay, pageReady]).then(hide);

    setTimeout(hide, 2500);
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const update = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    const open = () => {
      toggle.classList.add('is-open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      isOpen ? close() : open();
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const glow = document.querySelector('.cursor-glow');
    const dot = document.querySelector('.cursor-dot');
    if (!glow || !dot) return;

    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let tx = gx, ty = gy;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    });

    function raf() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const interactive = document.querySelectorAll('a, button, input, .entity-card, .req-card, .step-card');
    interactive.forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => dot.classList.remove('is-hovering'));
    });
  }

  function initPageTransitions() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.target === '_blank') return;
      if (href.startsWith('http') && !href.includes(location.hostname)) return;

      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        overlay.classList.add('is-active');
        setTimeout(() => {
          window.location.href = href;
        }, 320);
      });
    });
  }

  function initGuildStats() {
    const statEls = document.querySelectorAll('[data-stat]');
    if (!statEls.length) return;

    const dataPath = (window.EME.rootPath || './') + 'data/guild-stats.json';

    fetch(dataPath)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load guild stats');
        return res.json();
      })
      .then((stats) => {
        statEls.forEach((el) => {
          const key = el.dataset.stat;
          if (stats[key] === undefined) return;
          el.dataset.counter = stats[key];
          if (window.EME.animateCounter) {
          }
        });
        document.dispatchEvent(new CustomEvent('eme:stats-ready'));
      })
      .catch(() => {
        statEls.forEach((el) => {
          if (el.dataset.fallbackText) {
            el.textContent = el.dataset.fallbackText;
          }
        });
      });
  }

  document.addEventListener('eme:stats-ready', () => {
    const counters = document.querySelectorAll('[data-counter]:not([data-counted])');
    if (!('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        el.setAttribute('data-counted', '');
        window.EME.animateCounter(el, Number(el.dataset.counter));
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-counted', '');
            window.EME.animateCounter(entry.target, Number(entry.target.dataset.counter));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => observer.observe(el));
  });

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavbarScroll();
    initMobileMenu();
    initCursor();
    initPageTransitions();
    initGuildStats();
  });
})();
