
document.addEventListener('DOMContentLoaded', loadMembers);

async function loadMembers() {
  const grid = document.getElementById('members-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/members.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const members = await res.json();

    if (!Array.isArray(members) || members.length === 0) {
      grid.innerHTML = `<div class="grid-msg">No members listed yet.</div>`;
      return;
    }

    grid.innerHTML = members.map(renderMemberCard).join('');
  } catch (err) {
    console.error('Failed to load members.json', err);
    grid.innerHTML = `<div class="grid-msg">Member list is temporarily unavailable.</div>`;
  }
}

function renderMemberCard(username) {
  const safeName = escapeHtml(username);
  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`;
  const profileUrl = `https://hylexmc.net/player/${encodeURIComponent(username)}`;

  return `
    <a class="card player-card reveal" href="${profileUrl}" target="_blank" rel="noopener">
      <div class="head-wrap">
        <img src="${avatarUrl}" alt="${safeName}'s Minecraft avatar" loading="lazy" width="64" height="64" />
      </div>
      <div class="p-name">${safeName}</div>
      <div class="p-status"><span class="dot"></span>Guild member</div>
      <div class="p-link">View HylexMC profile</div>
    </a>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
