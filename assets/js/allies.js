(() => {
  'use strict';
  const list = document.getElementById('directory-list');
  const status = document.getElementById('list-status');
  async function load() {
    try {
      const allies = window.EME.validateList(await window.EME.fetchJSON('/data/allies.json'));
      document.getElementById('total-count').textContent = allies.length;
      list.replaceChildren();
      const fragment = document.createDocumentFragment();
      allies.forEach(ally => {
        const row = document.createElement('article'); row.className = 'ally-row';
        const emblem = document.createElement('span'); emblem.className = 'ally-emblem';
        emblem.textContent = ally.name.slice(0, 1).toUpperCase(); emblem.setAttribute('aria-hidden', 'true');
        const name = document.createElement('h2'); name.textContent = ally.name;
        const link = document.createElement('a');
        link.className = 'button button-ghost'; link.textContent = 'View Guild';
        link.href = `https://hylexmc.net/guilds/${encodeURIComponent(ally.name)}`;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `View ${ally.name} on HylexMC`);
        row.append(emblem, name, link); fragment.append(row);
      });
      list.append(fragment);
      status.textContent = allies.length ? `${allies.length} allied ${allies.length === 1 ? 'guild' : 'guilds'}.` : '';
      if (!allies.length) {
        const empty = document.createElement('p'); empty.className = 'empty-state';
        empty.textContent = 'No allied guilds are listed yet. Check back for updates.'; list.append(empty);
      }
    } catch {
      list.replaceChildren(); status.textContent = 'Unable to load the ally list. Please try again later.';
    } finally { list.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
