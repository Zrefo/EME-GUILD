const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        const roleId = '1543589138387697684';

        const updateStatus = () => {
            let totalMembers = 0;

            for (const guild of client.guilds.cache.values()) {
                const role = guild.roles.cache.get(roleId);

                if (role) {
                    totalMembers += role.members.size;
                }
            }

            client.user.setActivity(`${totalMembers} members`, {
                type: ActivityType.Playing
            });
        };

        updateStatus();

        setInterval(updateStatus, 60 * 1000);

        console.log('Bot status has been updated.');
    }
};
