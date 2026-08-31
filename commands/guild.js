const {
    SlashCommandBuilder,
    WebhookClient,
    EmbedBuilder
} = require('discord.js');

const allowedRoles = [
    '1543595770949804172',
    '1543718013889548438'
];

const guildRoleId = '1543589138387697684';

const welcomeWebhook = new WebhookClient({
    url: process.env.GUILD_WELCOME_WEBHOOK
});

const logWebhook = new WebhookClient({
    url: process.env.GUILD_LOG_WEBHOOK
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('Manage guild members.')
        
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('Choose an action.')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Add',
                        value: 'add'
                    },
                    {
                        name: 'Remove',
                        value: 'remove'
                    }
                )
        )

        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Select a Discord user.')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('nickname')
                .setDescription('Enter the in-game name.')
                .setRequired(true)
        ),

    async execute(interaction) {


        const hasPermission = allowedRoles.some(roleId =>
            interaction.member.roles.cache.has(roleId)
        );

        if (!hasPermission) {
            return;
        }



        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');
        const nickname = interaction.options.getString('nickname');

        const member = await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

        if (!member) {
            return interaction.reply({
                content: 'The selected user is not a member of this server.',
                ephemeral: true
            });
        }



        if (action === 'add') {

            await member.roles.add(guildRoleId);


            await welcomeWebhook.send({
                content: `> **Welcome our new guild member, ${user} <:65115tada:1543612287250726962>**`
            });


            const embed = new EmbedBuilder()
                .setColor('#24ff00')
                .setTitle('GUILD LOG')
                .setDescription(
                    `\`\`\`ansi
[2;40m[2;32mDiscord ID:[0m [2;35m${user.id}[0m
[2;40m[2;32mIn-game name:[0m [2;34m${nickname}[0m
[2;40m[2;32mAdded by:[0m [2;31m${interaction.user.id}[0m
\`\`\``
                )
                .setTimestamp();

            await logWebhook.send({
                embeds: [embed]
            });


            return interaction.reply({
                content: `Successfully added ${user} to the guild.`,
                ephemeral: true
            });
        }



        if (action === 'remove') {

            await member.roles.remove(guildRoleId);


            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('GUILD LOG')
                .setDescription(
                    `\`\`\`ansi
[2;40m[2;32mDiscord ID:[0m [2;35m${user.id}[0m
[2;40m[2;32mIn-game name:[0m [2;34m${nickname}[0m
[2;40m[2;32mRemoved by:[0m [2;31m${interaction.user.id}[0m
\`\`\``
                )
                .setTimestamp();

            await logWebhook.send({
                embeds: [embed]
            });


            return interaction.reply({
                content: `Successfully removed ${user} from the guild.`,
                ephemeral: true
            });
        }
    }
};
