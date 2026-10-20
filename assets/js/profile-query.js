(() => {
  'use strict';
  const root = document.getElementById('player-profile');
  const status = document.getElementById('lookup-status');
  const name = (new URLSearchParams(location.search).get('name') || '').trim();
  document.getElementById('player-name').value = name;
  if (!name) { root.hidden = true; return; }
  if (!/^[A-Za-z0-9_]{1,16}$/.test(name)) {
    root.hidden = true;
    status.textContent = 'Enter a Minecraft nickname using 1–16 letters, numbers, or underscores.';
    return;
  }
  root.dataset.player = name;
  root.querySelector('h1').textContent = name;
  const avatar = document.getElementById('profile-avatar');
  avatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(name)}/144`;
  avatar.alt = `${name}'s Minecraft head`;
  root.querySelector('.hylex-button').href = `https://hylexmc.net/players/${encodeURIComponent(name)}`;
  document.title = `${name} | EME Community Profile`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  const canonical = `https://eme-guild.xyz/profile/?name=${encodeURIComponent(name.toLowerCase())}`;
  document.querySelector('link[rel="canonical"]').href = canonical;
  document.querySelector('meta[property="og:url"]').content = canonical;
})();
