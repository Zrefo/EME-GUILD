(() => {
  'use strict';
  let path;
  try { path = decodeURIComponent(location.pathname); } catch { return; }
  const match = /^\/members\/([A-Za-z0-9_]{1,16})\/?$/.exec(path);
  if (!match) return;
  const name = match[1];
  const template = document.getElementById('profile-fallback-template');
  const fragment = template.content.cloneNode(true);
  const root = fragment.querySelector('#player-profile');
  root.dataset.player = name;
  root.querySelector('h1').textContent = name;
  const avatar = root.querySelector('#profile-avatar');
  avatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(name)}/144`;
  avatar.alt = `${name}'s Minecraft head`;
  root.querySelector('.hylex-button').href = `https://hylexmc.net/players/${encodeURIComponent(name)}`;
  document.getElementById('main').replaceWith(fragment);
  document.title = `${name} | EME Community Profile`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:url"]').content = `https://eme-guild.xyz/members/${name.toLowerCase()}/`;
  const script = document.createElement('script');
  script.src = '/assets/js/profile.js'; document.body.append(script);
})();
