// Public backend address only. Never put secrets here.
window.EME_ADMIN_ORIGIN = "https://eme-admin.raxon-heszi01.workers.dev"; // Example: https://admin.eme-guild.xyz
window.EMEDataURL = function (url) {
  const base = window.EME_ADMIN_ORIGIN.replace(/\/$/, "");
  if (!base) return url;
  const paths = {"/data/badges.json":"/api/public/badge-definitions", "/data/allies.json":"/api/public/allies", "/data/side-badges.json":"/api/public/side-badges"};
  return paths[url] ? base + paths[url] : url;
};
