/* ============================================================
   EME GUILD — stats.js
   Loads data/guild-stats.json and fills every element carrying
   a data-stat attribute. The Discord bot regenerates this file
   from the live Discord role count; this file only reads it.
   ============================================================ */

document.addEventListener('DOMContentLoaded', loadStats);

async function loadStats() {
  const targets = document.querySelectorAll('[data-stat]');
  if (!targets.length) return;

  try {
    const res = await fetch('data/guild-stats.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stats = await res.json();

    targets.forEach((el) => {
      const key = el.getAttribute('data-stat');
      if (stats[key] === undefined) return;
      animateCount(el, Number(stats[key]) || 0);
    });
  } catch (err) {
    console.error('Failed to load guild-stats.json', err);
    targets.forEach((el) => {
      el.textContent = '—';
    });
  }
}

function animateCount(el, target) {
  const duration = 900;
  const start = performance.now();
  const from = 0;

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target;
    return;
  }

  requestAnimationFrame(frame);
}
