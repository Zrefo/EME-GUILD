(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ambient = document.createElement('div');
  ambient.className = 'ambient-background';
  ambient.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('span');
    particle.className = 'ambient-particle';
    particle.style.setProperty('--x', `${(i * 29 + 7) % 100}%`);
    particle.style.setProperty('--delay', `${-i * 2.7}s`);
    particle.style.setProperty('--duration', `${22 + i % 5 * 4}s`);
    ambient.append(particle);
  }
  document.body.prepend(ambient);
  const motionToggle = document.createElement('button');
  motionToggle.className = 'motion-toggle';
  motionToggle.type = 'button';
  let motionPaused = false;
  try { motionPaused = localStorage.getItem('eme-motion-paused') === 'true'; } catch { /* Storage is optional. */ }
  function syncMotion() {
    document.documentElement.classList.toggle('motion-paused', motionPaused || document.hidden);
    motionToggle.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
    motionToggle.setAttribute('aria-pressed', String(motionPaused));
    motionToggle.hidden = reducedMotion.matches;
  }
  motionToggle.addEventListener('click', () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem('eme-motion-paused', String(motionPaused)); } catch { /* Storage is optional. */ }
    syncMotion();
  });
  document.body.append(motionToggle);
  document.addEventListener('visibilitychange', syncMotion);
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-in-view', entry.isIntersecting));
    });
    document.querySelectorAll('.hero-art, .community-visual, .final-cta').forEach(el => motionObserver.observe(el));
  }
  document.querySelectorAll('.page-heading, .requirement-card, .application-guide').forEach(el => el.classList.add('reveal'));
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');
  toggle.hidden = false;
  document.querySelector('.header').classList.add('js-nav');
  function closeMenu(returnFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  window.matchMedia('(min-width: 768px)').addEventListener('change', () => closeMenu());
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  let scrollPending = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    document.querySelector('.scroll-progress').style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  async function fetchJSON(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('Data unavailable');
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function validateList(data) {
    if (!Array.isArray(data) || data.some(item => !item || typeof item.name !== 'string' || !item.name.trim())) throw new Error('Invalid list');
    return data;
  }
  window.EME = { fetchJSON, validateList };
  function counter(el, value) {
    const formatted = new Intl.NumberFormat('en');
    el.setAttribute('aria-label', formatted.format(value));
    function animate() {
      if (reducedMotion.matches || value === 0) { el.textContent = formatted.format(value); return; }
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 1000, 1);
        el.textContent = formatted.format(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (!('IntersectionObserver' in window)) { animate(); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); animate(); }
    });
    observer.observe(el);
  }
  async function loadCount(type) {
    const el = document.getElementById(`${type}-count`);
    if (!el) return;
    try { counter(el, validateList(await fetchJSON(`/data/${type}.json`)).length); }
    catch { el.textContent = '—'; el.setAttribute('aria-label', 'Count unavailable'); }
  }
  loadCount('members');
  loadCount('allies');
  async function discordCount() {
    const el = document.getElementById('discord-count');
    if (!el) return;
    const note = document.getElementById('discord-note');
    try {
      const data = await fetchJSON('https://discord.com/api/v10/invites/AXxr3UpthV?with_counts=true');
      if (!Number.isSafeInteger(data.approximate_member_count) || data.approximate_member_count < 0) throw new Error('Count unavailable');
      counter(el, data.approximate_member_count);
      note.textContent = 'Approximate community size';
      return;
    } catch { /* Public API may be unavailable or rate limited. */ }
    try {
      const config = await fetchJSON('/data/config.json');
      if (Number.isSafeInteger(config.discordMemberCountFallback) && config.discordMemberCountFallback >= 0) {
        counter(el, config.discordMemberCountFallback);
        note.textContent = 'Last shared community count';
        return;
      }
    } catch { /* An unset fallback must not become a fabricated count. */ }
    el.textContent = '—';
    el.setAttribute('aria-label', 'Discord member count unavailable');
    note.textContent = 'Meet us on Discord';
  }
  discordCount();
})();
