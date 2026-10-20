(() => {
  'use strict';
  const list = document.getElementById('directory-list');
  const status = document.getElementById('list-status');
  const search = document.getElementById('ally-search');
  const clear = document.getElementById('clear-search');
  let allies = [];
  function render() {
      const query = search.value.trim().toLocaleLowerCase('en');
      const matches = allies.filter(ally => ally.name.toLocaleLowerCase('en').includes(query));
      clear.hidden = !search.value;
      list.replaceChildren();
      const fragment = document.createDocumentFragment();
      matches.forEach(ally => {
        const row = document.createElement('article'); row.className = 'ally-row';
        const emblem = document.createElement('span'); emblem.className = 'ally-emblem';
        emblem.textContent = ally.name.slice(0, 1).toUpperCase(); emblem.setAttribute('aria-hidden', 'true');
        if (ally.logo) {
          try { const url = new URL(ally.logo); if (['https:', 'http:'].includes(url.protocol)) {
            const img = new Image(); img.alt = ''; img.referrerPolicy = 'no-referrer'; img.loading = 'lazy';
            img.onerror = () => { emblem.textContent = ally.name.slice(0, 1).toUpperCase(); };
            img.src = url.href; emblem.replaceChildren(img);
          }} catch {}
        }
        const name = document.createElement('h2'); name.textContent = ally.name;
        const link = document.createElement('a');
        link.className = 'button button-ghost'; link.textContent = 'View Guild';
        link.href = `/guild/?name=${encodeURIComponent(ally.name)}`;
        
        link.setAttribute('aria-label', `View ${ally.name} guild profile`);
        row.append(emblem, name, link); fragment.append(row);
      });
      list.append(fragment);
      status.textContent = query ? `${matches.length} ${matches.length === 1 ? 'ally matches' : 'allies match'} your search.` : `${allies.length} allied ${allies.length === 1 ? 'guild' : 'guilds'}.`;
      if (!matches.length) {
        const empty = document.createElement('p'); empty.className = 'empty-state';
        empty.textContent = query ? 'No allies found.' : 'No allied guilds are listed yet. Check back for updates.'; list.append(empty);
      }
  }
  search.addEventListener('input', render);
  clear.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  async function load() {
    try {
      allies = window.EME.validateList(await window.EME.fetchJSON('/data/allies.json'));
      document.getElementById('total-count').textContent = allies.length;
      search.disabled = false;
      render();
    } catch {
      list.replaceChildren(); status.textContent = 'Unable to load the ally list. Please try again later.';
    } finally { list.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
