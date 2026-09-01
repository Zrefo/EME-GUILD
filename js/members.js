
document.addEventListener('DOMContentLoaded', loadMembers);

async function loadMembers() {
  const list = document.getElementById('members-list');
  if (!list) {
    console.error('[EME] #members-list container not found on this page.');
    return;
  }

  let res;
  try {
    res = await fetch('/data/members.json', { cache: 'no-store' });
  } catch (networkErr) {
    console.error('[EME] Network error fetching members.json:', networkErr);
    list.innerHTML = `<div class="grid-msg">Could not reach data/members.json (network error). Are you opening this file directly instead of through a server? Details: ${escapeHtml(String(networkErr))}</div>`;
    return;
  }

  if (!res.ok) {
    console.error('[EME] members.json HTTP error:', res.status, res.statusText);
    list.innerHTML = `<div class="grid-msg">data/members.json returned HTTP ${res.status} (${escapeHtml(res.statusText)}). Check the file exists at that exact path.</div>`;
    return;
  }

  let members;
  try {
    members = await res.json();
  } catch (parseErr) {
    console.error('[EME] members.json is not valid JSON:', parseErr);
    list.innerHTML = `<div class="grid-msg">data/members.json is not valid JSON. Details: ${escapeHtml(String(parseErr))}</div>`;
    return;
  }

  if (!Array.isArray(members) || members.length === 0) {
    list.innerHTML = `<div class="grid-msg">No members listed yet.</div>`;
    return;
  }

  list.innerHTML = members.map(renderMemberRow).join('');
}

function renderMemberRow(username) {
  const safeName = escapeHtml(username);
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/168`;
  const profileUrl = `https://hylexmc.net/players/${encodeURIComponent(username)}`;

  return `
    <a class="member-row" href="${profileUrl}" target="_blank" rel="noopener">
      <img class="member-avatar" src="${avatarUrl}" alt="${safeName}'s Minecraft avatar" loading="lazy" width="56" height="56" />
      <span class="member-name">${safeName}</span>
      <span class="member-link-hint">View profile →</span>
    </a>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
