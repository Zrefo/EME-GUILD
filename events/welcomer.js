const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        const welcomeChannelId = '1531485002586525898';
        const roleId = '1543588064985747477';

        const channel = member.guild.channels.cache.get(welcomeChannelId);

        const role = member.guild.roles.cache.get(roleId);

        if (role) {
            try {
                await member.roles.add(role);
            } catch (error) {
                console.error('Failed to assign role:', error);
            }
        }

        if (channel) {
            const messages = [
                `👋 Welcome to the server, ${member}!`,
                `🎉 Hey ${member}, welcome!`,
                `🚀 Welcome ${member}! Have fun!`,
                `✨ Glad to have you here, ${member}!`,
                `🔥 Welcome ${member}! Enjoy your stay!`
            ];

            const randomMessage =
                messages[Math.floor(Math.random() * messages.length)];

            await channel.send(randomMessage);
        }
    }
};
