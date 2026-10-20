(() => {
  'use strict';
  const name = (new URLSearchParams(location.search).get('name') || '').trim();
  const status = document.getElementById('guild-status');
  const emblem = document.getElementById('guild-emblem');
  if (!name || name.length > 100 || /[\u0000-\u001f]/.test(name)) {
    status.textContent = 'Choose a guild from the Allies page to view its profile.';
    return;
  }
  document.getElementById('guild-name').textContent = name;
  document.title = `${name} | EME Guild`;
  emblem.textContent = name.slice(0, 1).toUpperCase();
  const link = document.getElementById('guild-link');
  link.href = `https://hylexmc.net/guilds/${encodeURIComponent(name)}`;
  link.hidden = false;
  function safeURL(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
    catch { return null; }
  }
  async function load() {
    try {
      const allies = window.EME.validateList(await window.EME.fetchJSON('/data/allies.json'));
      const guild = allies.find(item => item.name.toLocaleLowerCase('en') === name.toLocaleLowerCase('en'));
      status.textContent = guild ? 'EME ally' : 'Community guild profile';
      if (!guild) return;
      document.getElementById('guild-name').textContent = guild.name;
      for (const field of ['description', 'requirements']) {
        const text = guild[field];
        if (typeof text === 'string' && text.trim()) document.getElementById(`guild-${field}`).textContent = text.trim();
      }
      const profile = safeURL(guild.profileUrl);
      if (profile) link.href = profile;
      const logo = safeURL(guild.logo);
      if (logo) {
        const img = new Image();
        img.alt = '';
        img.referrerPolicy = 'no-referrer';
        img.onload = () => emblem.replaceChildren(img);
        img.src = logo;
      }
    } catch { status.textContent = 'Guild details could not be loaded. Please try again later.'; }
  }
  load();
})();
