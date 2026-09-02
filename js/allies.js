
document.addEventListener('DOMContentLoaded', loadAllies);

async function loadAllies() {
  const list = document.getElementById('allies-list');
  if (!list) {
    console.error('[EME] #allies-list container not found on this page.');
    return;
  }

  let res;
  try {
    res = await fetch('../data/allies.json', { cache: 'no-store' });
  } catch (networkErr) {
    console.error('[EME] Network error fetching allies.json:', networkErr);
    list.innerHTML = `<div class="grid-msg">Could not reach ../ata/allies.json (network error). Are you opening this file directly instead of through a server? Details: ${escapeHtml(String(networkErr))}</div>`;
    return;
  }

  if (!res.ok) {
    console.error('[EME] allies.json HTTP error:', res.status, res.statusText);
    list.innerHTML = `<div class="grid-msg">../data/allies.json returned HTTP ${res.status} (${escapeHtml(res.statusText)}). Check the file exists at that exact path.</div>`;
    return;
  }

  let allies;
  try {
    allies = await res.json();
  } catch (parseErr) {
    console.error('[EME] allies.json is not valid JSON:', parseErr);
    list.innerHTML = `<div class="grid-msg">../data/allies.json is not valid JSON. Details: ${escapeHtml(String(parseErr))}</div>`;
    return;
  }

  if (!Array.isArray(allies) || allies.length === 0) {
    list.innerHTML = `<div class="grid-msg">No allied guilds yet.</div>`;
    return;
  }

  list.innerHTML = allies.map(renderAllyRow).join('');
}

function renderAllyRow(entry, index) {
  const name = typeof entry === 'string' ? entry : entry.name || 'Unknown Guild';
  const safeName = escapeHtml(name);
  const num = String(index + 1).padStart(2, '0');
  const guildUrl = `https://hylexmc.net/guilds/${encodeURIComponent(name)}`;

  return `
    <a class="ally-row" href="${guildUrl}" target="_blank" rel="noopener">
      <span class="rt-index">${num}</span>
      <span class="ally-name">${safeName}</span>
      <span class="ally-badge">ALLY</span>
    </a>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
