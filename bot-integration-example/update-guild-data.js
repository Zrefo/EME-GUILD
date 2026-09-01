/**
 * EME Guild — example bot-side helper
 * -------------------------------------------------
 * Runs on the Discord bot's OWN hosting (not GitHub Pages).
 * Reads/writes the website's data/*.json files through the
 * GitHub REST API, so the static site never needs a backend.
 *
 * npm install @octokit/rest
 *
 * Required environment variables on the bot host:
 *   GITHUB_TOKEN   - a fine-grained PAT with "Contents: Read and write"
 *                    permission, scoped to this one repo only
 *   GITHUB_OWNER   - e.g. "your-username"
 *   GITHUB_REPO    - e.g. "eme-guild"
 *   GITHUB_BRANCH  - e.g. "main"
 */

const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

/**
 * Reads and JSON-parses a file from the repo.
 */
async function readJsonFile(path) {
  const { data } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path,
    ref: BRANCH,
  });
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { json: JSON.parse(content), sha: data.sha };
}

/**
 * Writes a JS value back to a JSON file in the repo as a commit.
 */
async function writeJsonFile(path, value, sha, message) {
  const content = Buffer.from(JSON.stringify(value, null, 2) + '\n').toString('base64');
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content,
    sha, // omit this arg on first-ever write to a brand-new file
    branch: BRANCH,
  });
}

/** /member add <username> */
async function addMember(username) {
  const { json: members, sha } = await readJsonFile('data/members.json');
  if (members.includes(username)) return false;
  members.push(username);
  await writeJsonFile('data/members.json', members, sha, `Add member: ${username}`);
  return true;
}

/** /member remove <username> */
async function removeMember(username) {
  const { json: members, sha } = await readJsonFile('data/members.json');
  const next = members.filter((m) => m.toLowerCase() !== username.toLowerCase());
  if (next.length === members.length) return false;
  await writeJsonFile('data/members.json', next, sha, `Remove member: ${username}`);
  return true;
}

/** /ally add <guildName> [logoUrl] */
async function addAlly(name, logo = '') {
  const { json: allies, sha } = await readJsonFile('data/allies.json');
  if (allies.some((a) => (typeof a === 'string' ? a : a.name) === name)) return false;
  allies.push({ name, logo });
  await writeJsonFile('data/allies.json', allies, sha, `Add ally: ${name}`);
  return true;
}

/** /ally remove <guildName> */
async function removeAlly(name) {
  const { json: allies, sha } = await readJsonFile('data/allies.json');
  const next = allies.filter((a) => (typeof a === 'string' ? a : a.name) !== name);
  if (next.length === allies.length) return false;
  await writeJsonFile('data/allies.json', next, sha, `Remove ally: ${name}`);
  return true;
}

/**
 * Recomputes guild-stats.json from the current data files + the live
 * Discord role count. Call this after any add/remove, and/or on a timer
 * (e.g. every 10-15 minutes) from wherever your bot's scheduler lives.
 *
 * @param {import('discord.js').Guild} discordGuild
 * @param {string} memberRoleId - the role ID that marks someone as an EME Guild member
 */
async function syncStats(discordGuild, memberRoleId) {
  const role = await discordGuild.roles.fetch(memberRoleId);
  const memberCount = role ? role.members.size : 0;

  const { json: allies, sha: statsSha } = await readJsonFile('data/guild-stats.json');
  const { json: alliesList } = await readJsonFile('data/allies.json');

  const stats = {
    memberCount,
    allyCount: alliesList.length,
    updatedAt: new Date().toISOString(),
  };

  await writeJsonFile('data/guild-stats.json', stats, statsSha, 'Sync guild stats');
  return stats;
}

module.exports = { addMember, removeMember, addAlly, removeAlly, syncStats };
