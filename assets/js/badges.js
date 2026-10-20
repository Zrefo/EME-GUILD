/* Calendar milestones use UTC dates; no badge is awarded for missing/future dates. */
(() => {
  'use strict';
  const DAY = 86400000;
  function parseDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value ? date : null;
  }
  function threshold(joined, badge) {
    if (badge.days) return new Date(+joined + badge.days * DAY);
    const month = joined.getUTCMonth() + (badge.months || 0) + (badge.years || 0) * 12;
    const last = new Date(Date.UTC(joined.getUTCFullYear(), month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(joined.getUTCFullYear(), month, Math.min(joined.getUTCDate(), last)));
  }
  function resolve(member, config, now = new Date(), assignments = {}) {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const joined = parseDate(member.joined);
    const valid = joined && joined <= today;
    const milestones = config.tenure.map(b => ({ ...b, date: valid ? threshold(joined, b) : null }));
    const unlocked = milestones.filter(b => b.date && b.date <= today);
    const earned = unlocked.slice(-1);
    const next = valid ? milestones.find(b => b.date > today) : null;
    const roleKeys = [...new Set([...(Array.isArray(member.roles) ? member.roles : []), member.role, ...(member.helper === true ? ['helper'] : [])].filter(v => typeof v === 'string').map(v => v.trim().toLowerCase()))];
    const roles = roleKeys.map(key => config.roles[key]).filter(Boolean);
    const entry = Object.entries(assignments).find(([name]) => name.toLowerCase() === member.name.toLowerCase())?.[1];
    const special = [...new Set(Array.isArray(entry?.badges) ? entry.badges : [])].map(id => config.special?.[id]).filter(Boolean);
    const days = valid ? Math.floor((today - joined) / DAY) : null;
    const previous = earned.length ? earned[earned.length - 1].date : joined;
    const progress = next ? Math.max(0, Math.min(1, (today - previous) / (next.date - previous))) : valid ? 1 : 0;
    return { joined: valid ? joined : null, days, earned, next, roles, special, progress, remaining: next ? Math.ceil((next.date - today) / DAY) : null };
  }
  function badgeElement(badge, locked = false) {
    const el = document.createElement('div');
    el.className = `exclusive-badge${locked ? ' badge-locked' : ''}`;
    el.style.setProperty('--badge-color', /^#[0-9a-f]{6}$/i.test(badge.color || '') ? badge.color : '#3ddd87');
    el.title = badge.title || badge.label;
    const logo = document.createElement('span'); logo.className = 'badge-logo'; logo.setAttribute('aria-hidden', 'true');
    if (badge.logo) { try { const u = new URL(badge.logo); if (['https:', 'http:'].includes(u.protocol)) {
      const img = new Image(); img.alt = ''; img.referrerPolicy = 'no-referrer';
      img.onload = () => { logo.classList.add('badge-custom-logo'); logo.replaceChildren(img); }; img.src = u.href;
    }} catch {} }
    const label = document.createElement('span'); label.className = 'badge-label'; label.textContent = badge.label;
    el.append(logo, label);
    el.setAttribute('aria-label', `${badge.title || badge.label}${locked ? ' — not yet earned' : ''}`);
    return el;
  }
  window.EMEBadges = { parseDate, threshold, resolve, badgeElement };
})();
