(function () {
  const grid = document.getElementById('alliances-grid');
  const searchInput = document.getElementById('alliance-search');
  const countBadge = document.getElementById('alliances-count-badge');
  if (!grid) return;

  const root = (window.EME && window.EME.rootPath) || './';
  let allAllies = [];

  function guildProfileUrl(name) {
    return `https://hylexmc.net/guilds/${encodeURIComponent(name)}`;
  }

  const SHIELD_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"/></svg>`;

  function renderSkeletons(count) {
    grid.innerHTML = Array.from({ length: count })
      .map(
        () => `
      <div class="skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line" style="width:40%"></div>
        </div>
      </div>`
      )
      .join('');
  }

  function renderMessage(text, isError) {
    grid.innerHTML = `<p class="state-message${isError ? ' is-error' : ''}">${text}</p>`;
  }

  function renderAllies(list) {
    if (!list.length) {
      renderMessage('No alliances found.', false);
      return;
    }

    grid.innerHTML = list
      .map((entry, i) => {
        const safeName = String(entry.name);
        const number = String(entry.index + 1).padStart(2, '0');
        return `
        <div class="entity-card" data-reveal data-reveal-delay="${Math.min(i * 40, 400)}">
          <span class="entity-number">${number}</span>
          <div class="alliance-icon">${SHIELD_ICON}</div>
          <div class="entity-info">
            <div class="entity-name">${safeName}</div>
            <a class="entity-link" href="${guildProfileUrl(safeName)}" target="_blank" rel="noopener noreferrer">
              View guild profile ↗
            </a>
            <div class="entity-status">Allied</div>
          </div>
        </div>`;
      })
      .join('');

    requestAnimationFrame(() => {
      const els = grid.querySelectorAll('[data-reveal]');
      if (!('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-visible'));
        return;
      }
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = Number(entry.target.dataset.revealDelay || 0);
              setTimeout(() => entry.target.classList.add('is-visible'), delay);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      els.forEach((el) => obs.observe(el));
    });
  }

  function updateCountBadge(count) {
    if (countBadge) countBadge.textContent = `${count} ALLIANCE${count === 1 ? '' : 'S'}`;
  }

  function applyFilter(query) {
    const q = query.trim().toLowerCase();
    const filtered = q ? allAllies.filter((entry) => entry.name.toLowerCase().includes(q)) : allAllies;
    updateCountBadge(filtered.length);
    renderAllies(filtered);
  }

  renderSkeletons(4);

  fetch(`${root}data/allies.json`)
    .then((res) => {
      if (!res.ok) throw new Error('allies.json not found');
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Invalid allies data');
      allAllies = data
        .filter((n) => typeof n === 'string' && n.trim().length)
        .map((name, index) => ({ name, index }));
      updateCountBadge(allAllies.length);
      renderAllies(allAllies);
    })
    .catch(() => {
      renderMessage('Unable to load alliances.', true);
      updateCountBadge(0);
    });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => applyFilter(e.target.value));
  }
})();
