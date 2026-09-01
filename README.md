# EME Guild — Website

Static website for **EME Guild** (HylexMC), built for GitHub Pages.
No backend. No frameworks. Plain HTML/CSS/JS.

## Structure

```
index.html            All sections (Home, About, Info, Owner, Members, Allies, Rules)
css/style.css          Design tokens, layout, components
css/animations.css     Keyframes, scroll-reveal
css/responsive.css     Media queries
js/main.js             Nav, mobile menu, scroll reveal, particles, rule accordions
js/stats.js            Reads data/guild-stats.json → fills [data-stat] elements
js/members.js          Reads data/members.json → renders player cards
js/allies.js           Reads data/allies.json → renders ally cards
data/members.json      Minecraft usernames (bot-managed)
data/allies.json       Allied guilds (bot-managed)
data/guild-stats.json  memberCount / allyCount (bot-managed)
```

## Running locally

Because the JS uses `fetch()` on local JSON files, opening `index.html`
directly (`file://`) will fail in most browsers (CORS). Serve it instead:

```bash
cd eme-guild
python3 -m http.server 8000
# then open http://localhost:8000
```

or with the VS Code "Live Server" extension.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo (root of the repo, or a `/docs` folder).
2. Repo → Settings → Pages → Source: your branch (and `/docs` if used).
3. Wait a minute — your site is live at `https://<user>.github.io/<repo>/`.

## Discord bot integration (bot hosted elsewhere)

The bot never talks to the website directly — the website is static and has
no server to receive requests. Instead, the bot edits the JSON files in
`data/` and pushes the change to the GitHub repo via the **GitHub REST API**.
GitHub Pages then serves the updated files automatically after the commit.

Flow:

```
/member add Steve   (Discord command)
        │
        ▼
Bot fetches current data/members.json from GitHub (API)
Bot adds "Steve" to the array
Bot commits the updated file back to the repo (API)
        │
        ▼
GitHub Pages rebuilds (usually <1 min)
        │
        ▼
Website's members.js fetches the new members.json on next page load
```

For the member **count**, the bot should count how many Discord members
currently hold the EME Guild role, then write that number into
`data/guild-stats.json` — either on a schedule (e.g. every 10–15 minutes)
or right after any `/member` command.

See `bot-integration-example/update-guild-data.js` for a minimal,
framework-agnostic example of the "read file → edit → commit" call using
Octokit (works from any Node.js hosting: VPS, Railway, Render, etc. —
does not need to be the same host as GitHub Pages).

**Never** put the bot token, a GitHub personal access token, or any other
secret inside the website's JS or JSON files. Those only ever live as
environment variables on the bot's own host.

## Extending later

The brief anticipates future sections (announcements, events, leaderboards,
live Discord count, etc.). Follow the existing pattern for each:

1. Add a `data/<thing>.json` file the bot can update.
2. Add a small `js/<thing>.js` that fetches it and renders markup into a
   container `<div id="...-grid">` — copy `allies.js` as a template.
2. Add the section markup + a nav link in `index.html`.
