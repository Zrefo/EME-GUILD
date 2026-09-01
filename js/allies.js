/* ============================================================
   EME GUILD — allies.js
   Loads data/allies.json and renders ally cards.
   The Discord bot updates allies.json; this file only reads it.
   ============================================================ */

document.addEventListener('DOMContentLoaded', loadAllies);

async function loadAllies() {
  const grid = document.getElementById('allies-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/allies.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const allies = await res.json();

    if (!Array.isArray(allies) || allies.length === 0) {
      grid.innerHTML = `<div class="grid-msg">No allied guilds yet.</div>`;
      return;
    }

    grid.innerHTML = allies.map(renderAllyCard).join('');
  } catch (err) {
    console.error('Failed to load allies.json', err);
    grid.innerHTML = `<div class="grid-msg">Ally list is temporarily unavailable.</div>`;
  }
}

/**
 * Accepts either a plain string ("GuildName") or an object
 * ({ name: "GuildName", logo: "https://..." }) so the bot can
 * add logos later without breaking the frontend.
 */
function renderAllyCard(entry) {
  const name = typeof entry === 'string' ? entry : entry.name || 'Unknown Guild';
  const logo = typeof entry === 'object' && entry.logo ? entry.logo : '';
  const safeName = escapeHtml(name);
  const initial = safeName.trim().charAt(0).toUpperCase() || '?';

  const logoHtml = logo
    ? `<img src="${logo}" alt="${safeName} logo" width="44" height="44" loading="lazy" style="border-radius:3px;" />`
    : `<div class="ally-logo">${initial}</div>`;

  return `
    <div class="card ally-card reveal">
      <span class="ally-badge">ALLY</span>
      ${logoHtml}
      <div class="ally-name">${safeName}</div>
      <div class="ally-sub">Allied guild on HylexMC</div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
