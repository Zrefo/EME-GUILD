/* ============================================================
   EME GUILD — allies.js
   Loads data/allies.json and renders a plain list of guild names.
   The Discord bot updates allies.json; this file only reads it.
   ============================================================ */

document.addEventListener('DOMContentLoaded', loadAllies);

async function loadAllies() {
  const list = document.getElementById('allies-list');
  if (!list) return;

  try {
    const res = await fetch('data/allies.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const allies = await res.json();

    if (!Array.isArray(allies) || allies.length === 0) {
      list.innerHTML = `<div class="grid-msg">No allied guilds yet.</div>`;
      return;
    }

    list.innerHTML = allies.map(renderAllyRow).join('');
  } catch (err) {
    console.error('Failed to load allies.json', err);
    list.innerHTML = `<div class="grid-msg">Ally list is temporarily unavailable.</div>`;
  }
}

/**
 * Accepts either a plain string ("GuildName") or an object
 * ({ name: "GuildName", ... }) so older data files still work.
 */
function renderAllyRow(entry, index) {
  const name = typeof entry === 'string' ? entry : entry.name || 'Unknown Guild';
  const safeName = escapeHtml(name);
  const num = String(index + 1).padStart(2, '0');

  return `
    <div class="ally-row reveal">
      <span class="rt-index">${num}</span>
      <span class="ally-name">${safeName}</span>
      <span class="ally-badge">ALLY</span>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
