(() => {
  'use strict';
  document.querySelectorAll('.system-list article, .join-path article').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${i % 3 * 65}ms`);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('offscreen-motion', !entry.isIntersecting);
    }));
    document.querySelectorAll('.community-sculpture').forEach(el => observer.observe(el));
  }
})();

