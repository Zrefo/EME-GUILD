(() => {
  'use strict';
  const status = document.getElementById('profile-status');
  const root = document.getElementById('player-profile');
  if (!root) return;
  const name = root.dataset.player;
  if (!name) return;
  const dateFormat = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const avatar = document.getElementById('profile-avatar');
  const avatarFallback = () => { avatar.src = '/assets/images/eme-logo.png'; avatar.alt = 'EME logo'; };
  avatar.addEventListener('error', avatarFallback, { once: true });
  if (avatar.complete && !avatar.naturalWidth) avatarFallback();
  const hylexLogo = document.getElementById('hylex-logo');
  hylexLogo.addEventListener('error', () => { hylexLogo.hidden = true; }, { once: true });
  if (hylexLogo.complete && !hylexLogo.naturalWidth) hylexLogo.hidden = true;
  async function load() {
    let member, config, inGuild, assignments = {}, sideWarning = '';
    try {
      const members = window.EME.validateList(await window.EME.fetchJSON('/data/members.json'));
      member = members.find(m => m.name.toLowerCase() === name.toLowerCase());
      inGuild = Boolean(member);
      if (!member) member = { name };
      document.getElementById('profile-role').textContent = inGuild ? (member.role || 'Member') : 'Community profile · Not a guild member';
      document.querySelector('.next-milestone').hidden = !inGuild;
      document.querySelectorAll('[data-guild-stat]').forEach(el => { el.hidden = !inGuild; });
      document.querySelector('.profile-stats').classList.toggle('community-stats', !inGuild);
    } catch {
      status.textContent = 'Unable to load this profile. Please try again later.';
      return;
    }
    try {
      config = await window.EME.fetchJSON('/data/badges.json');
      try {
        const response = await fetch(window.EMEDataURL('/data/side-badges.json'), { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(8000) });
        if (response.status !== 404) {
          if (!response.ok) throw new Error('Unavailable');
          assignments = await response.json();
          if (!assignments || Array.isArray(assignments) || typeof assignments !== 'object') throw new Error('Invalid assignments');
        }
      } catch { assignments = {}; sideWarning = 'Additional badges are temporarily unavailable.'; }
      function render() {
        const state = window.EMEBadges.resolve(member, config, new Date(), assignments);
        document.getElementById('joined-date').textContent = state.joined ? dateFormat.format(state.joined) : 'Not recorded';
        document.getElementById('tenure-days').textContent = state.days === null ? '—' : state.days.toLocaleString('en');
        const badges = document.getElementById('earned-badges'); badges.replaceChildren();
        [...state.roles, ...state.earned, ...state.special].forEach(b => badges.append(window.EMEBadges.badgeElement(b)));
        if (!badges.childElementCount) {
          const empty = document.createElement('p'); empty.textContent = !inGuild ? 'No badges have been awarded yet.' : state.joined ? 'Your first milestone is ahead. Every day counts.' : 'Tenure badges will appear when a joining date is recorded.';
          badges.append(empty);
        }
        document.getElementById('badge-total').textContent = state.roles.length + state.earned.length + state.special.length;
        document.getElementById('next-title').textContent = state.next ? state.next.label : state.joined ? 'Every milestone unlocked' : 'Your journey starts with a date';
        document.getElementById('next-description').textContent = state.next ? `${state.remaining} ${state.remaining === 1 ? 'day' : 'days'} to go · Unlocks ${dateFormat.format(state.next.date)}` : state.joined ? 'Thank you for being part of the EME story.' : 'A recorded joining date is needed to calculate membership milestones.';
        const progress = document.getElementById('milestone-progress');
        progress.value = state.progress; progress.hidden = !state.joined;
        status.textContent = sideWarning;
      }
      render();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
      setInterval(() => { if (!document.hidden) render(); }, 60000);
    } catch { status.textContent = 'Profile loaded, but badges are temporarily unavailable. Please try again later.'; }
  }
  load();
})();
