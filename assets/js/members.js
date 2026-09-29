(() => {
  'use strict';
  const list = document.getElementById('directory-list');
  const status = document.getElementById('list-status');
  const search = document.getElementById('member-search');
  const clear = document.getElementById('clear-search');
  let members = [];
  function render() {
    const query = search.value.trim().toLocaleLowerCase('en');
    const matches = members.filter(member => member.name.toLocaleLowerCase('en').includes(query));
    clear.hidden = !search.value;
    list.replaceChildren();
    const fragment = document.createDocumentFragment();
    matches.forEach(member => {
      const row = document.createElement('article');
      row.className = 'member-row';
      const avatar = document.createElement('img');
      avatar.className = 'avatar'; avatar.width = 48; avatar.height = 48;
      avatar.alt = `${member.name}'s Minecraft head`; avatar.loading = 'lazy'; avatar.decoding = 'async';
      avatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(member.name)}`;
      avatar.addEventListener('error', () => { avatar.src = '/assets/images/eme-logo.png'; avatar.alt = 'EME logo'; }, { once: true });
      const info = document.createElement('div'); info.className = 'member-info';
      const name = document.createElement('h2'); name.textContent = member.name; info.append(name);
      if (typeof member.role === 'string' && member.role.trim()) {
        const role = document.createElement('p');
        role.textContent = member.role;
        const roleKey = member.role.trim().toLowerCase();
        if (['founder', 'mod', 'member'].includes(roleKey)) role.classList.add(`role-${roleKey}`);
        info.append(role);
      }
      const link = document.createElement('a');
      link.className = 'button button-ghost'; link.textContent = 'View Profile';
      link.href = `https://hylexmc.net/players/${encodeURIComponent(member.name)}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `View ${member.name}'s profile on HylexMC`);
      row.append(avatar, info, link); fragment.append(row);
    });
    list.append(fragment);
    if (!matches.length) {
      const empty = document.createElement('p'); empty.className = 'empty-state';
      empty.textContent = 'No members found.'; list.append(empty);
    }
    status.textContent = query ? `${matches.length} ${matches.length === 1 ? 'member matches' : 'members match'} your search.` : `${members.length} ${members.length === 1 ? 'member' : 'members'} in the guild.`;
  }
  search.addEventListener('input', render);
  clear.addEventListener('click', () => { search.value = ''; render(); search.focus(); });
  async function load() {
    try {
      members = window.EME.validateList(await window.EME.fetchJSON('/data/members.json'));
      document.getElementById('total-count').textContent = members.length;
      search.disabled = false; render();
    } catch {
      list.replaceChildren();
      status.textContent = 'Unable to load the member list. Please try again later.';
    } finally { list.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
