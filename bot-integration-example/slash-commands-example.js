/**
 * EME Guild — example discord.js v14 command handler
 * -------------------------------------------------
 * Minimal sketch showing how /member and /ally commands
 * call into update-guild-data.js. Adapt to your bot's
 * actual command framework/structure.
 */

const { SlashCommandBuilder } = require('discord.js');
const { addMember, removeMember, addAlly, removeAlly, syncStats } = require('./update-guild-data');

const MEMBER_ROLE_ID = process.env.EME_MEMBER_ROLE_ID; // set this in your bot's env

const commands = [
  new SlashCommandBuilder()
    .setName('member')
    .setDescription('Manage the EME Guild website member list')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add a Minecraft username to the website')
        .addStringOption((opt) => opt.setName('username').setDescription('Minecraft username').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a Minecraft username from the website')
        .addStringOption((opt) => opt.setName('username').setDescription('Minecraft username').setRequired(true))
    ),

  new SlashCommandBuilder()
    .setName('ally')
    .setDescription('Manage the EME Guild website ally list')
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Add an allied guild to the website')
        .addStringOption((opt) => opt.setName('name').setDescription('Guild name').setRequired(true))
        .addStringOption((opt) => opt.setName('logo').setDescription('Logo image URL').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove an allied guild from the website')
        .addStringOption((opt) => opt.setName('name').setDescription('Guild name').setRequired(true))
    ),
];

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'member') {
    const username = interaction.options.getString('username');
    const sub = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: true });

    const ok = sub === 'add' ? await addMember(username) : await removeMember(username);
    await syncStats(interaction.guild, MEMBER_ROLE_ID);

    await interaction.editReply(
      ok ? `Done — **${username}** ${sub === 'add' ? 'added to' : 'removed from'} the website.`
         : `**${username}** was already ${sub === 'add' ? 'on' : 'not on'} the list.`
    );
  }

  if (interaction.commandName === 'ally') {
    const name = interaction.options.getString('name');
    const logo = interaction.options.getString('logo') || '';
    const sub = interaction.options.getSubcommand();

    await interaction.deferReply({ ephemeral: true });

    const ok = sub === 'add' ? await addAlly(name, logo) : await removeAlly(name);
    await syncStats(interaction.guild, MEMBER_ROLE_ID);

    await interaction.editReply(
      ok ? `Done — **${name}** ${sub === 'add' ? 'added as an ally' : 'removed as an ally'}.`
         : `**${name}** was already ${sub === 'add' ? 'an ally' : 'not an ally'}.`
    );
  }
}

module.exports = { commands, handleInteraction };
