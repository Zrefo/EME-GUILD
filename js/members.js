(function () {
  const grid = document.getElementById('members-grid');
  const searchInput = document.getElementById('member-search');
  const countBadge = document.getElementById('members-count-badge');
  if (!grid) return;

  const root = (window.EME && window.EME.rootPath) || './';
  let allMembers = [];

  function avatarUrl(nickname) {
    return `https://mc-heads.net/avatar/${encodeURIComponent(nickname)}`;
  }

  function profileUrl(nickname) {
    return `https://hylexmc.net/players/${encodeURIComponent(nickname)}`;
  }

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

  function renderMembers(list) {
    if (!list.length) {
      renderMessage('No members found.', false);
      return;
    }

    grid.innerHTML = list
      .map((entry, i) => {
        const safeName = String(entry.name);
        const number = String(entry.index + 1).padStart(2, '0');
        return `
        <div class="entity-card" data-reveal data-reveal-delay="${Math.min(i * 40, 400)}">
          <span class="entity-number">${number}</span>
          <img
            class="member-avatar"
            src="${avatarUrl(safeName)}"
            alt="${safeName}'s Minecraft avatar"
            width="56" height="56"
            loading="lazy"
            onerror="this.onerror=null;this.src='${root}assets/images/eme-logo.png';"
          />
          <div class="entity-info">
            <div class="entity-name">${safeName}</div>
            <a class="entity-link" href="${profileUrl(safeName)}" target="_blank" rel="noopener noreferrer">
              View HylexMC profile ↗
            </a>
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
    if (countBadge) countBadge.textContent = `${count} MEMBER${count === 1 ? '' : 'S'}`;
  }

  function applyFilter(query) {
    const q = query.trim().toLowerCase();
    const filtered = q ? allMembers.filter((entry) => entry.name.toLowerCase().includes(q)) : allMembers;
    updateCountBadge(filtered.length);
    renderMembers(filtered);
  }

  renderSkeletons(6);

  fetch(`${root}data/members.json`)
    .then((res) => {
      if (!res.ok) throw new Error('members.json not found');
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Invalid members data');
      allMembers = data
        .filter((n) => typeof n === 'string' && n.trim().length)
        .map((name, index) => ({ name, index }));
      updateCountBadge(allMembers.length);
      renderMembers(allMembers);
    })
    .catch(() => {
      renderMessage('Unable to load guild members.', true);
      updateCountBadge(0);
    });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => applyFilter(e.target.value));
  }
})();
