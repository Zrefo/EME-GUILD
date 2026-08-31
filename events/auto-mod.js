const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        try {
            const response = await fetch('https://vector.profanity.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message.content
                })
            });

            if (!response.ok) {
                console.error(
                    `ProfanityAPI returned status ${response.status}`
                );
                return;
            }

            const result = await response.json();

            if (!result.isProfanity) return;

            const warning = await message.reply(
                "> **Watch your words, or you'll get a ticket for a seven-day vacation!**"
            );

            await message.delete().catch(() => {});

            setTimeout(() => {
                warning.delete().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('AutoMod error:', error);
        }
    }
};
