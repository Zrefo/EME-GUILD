(() => {
  'use strict';
  async function load() {
    const status = document.getElementById('catalog-status');
    try {
      const config = await window.EME.fetchJSON('/data/badges.json');
      const groups = [
        ['tenure-catalog', config.tenure, 'Automatically awarded for time in the guild. Only the highest unlocked milestone appears on a profile.'],
        ['roles-catalog', Object.values(config.roles), 'Assigned through the current guild role.'],
        ['special-catalog', Object.values(config.special).filter(b => b.id !== 'ally'), 'Awarded individually by EME leadership. Available to guild members and the wider community.'],
        ['alliance-catalog', [config.special.ally], 'Awarded individually to players connected with an allied guild.']
      ];
      groups.forEach(([id, badges, description]) => {
        const list = document.getElementById(id); list.replaceChildren();
        badges.forEach(b => {
          const card = document.createElement('article'); card.className = 'catalog-card';
          card.append(window.EMEBadges.badgeElement(b));
          const title = document.createElement('h3'); title.textContent = b.title;
          const text = document.createElement('p'); text.textContent = b.description || description;
          card.append(title, text); list.append(card);
        });
      });
      status.textContent = '';
    } catch { status.textContent = 'Unable to load the badge collection. Please try again later.'; }
  }
  load();
})();
