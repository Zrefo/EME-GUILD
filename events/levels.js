const {
    Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const {
    minXp,
    maxXp,
    xpCooldown,
    levelUpChannelId,
    levelRoles
} = require('../data/level-config');

const dataPath = path.join(
    __dirname,
    '..',
    'data',
    'levels.json'
);



function loadData() {
    try {
        return JSON.parse(
            fs.readFileSync(dataPath, 'utf8')
        );
    } catch {
        return {
            users: {}
        };
    }
}



function saveData(data) {
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 4)
    );
}



function xpForLevel(level) {
    return Math.floor(
        100 * Math.pow(level, 1.5)
    );
}



function calculateLevel(totalXp) {
    let level = 0;

    while (
        totalXp >= xpForLevel(level + 1)
    ) {
        level++;
    }

    return level;
}



const cooldowns = new Map();



module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (!message.guild) return;
        if (message.author.bot) return;

        const userId = message.author.id;

        const now = Date.now();

        const lastMessage = cooldowns.get(userId);

        if (
            lastMessage &&
            now - lastMessage < xpCooldown
        ) {
            return;
        }

        cooldowns.set(
            userId,
            now
        );



        const data = loadData();

        if (!data.users[userId]) {
            data.users[userId] = {
                xp: 0,
                level: 0
            };
        }

        const userData = data.users[userId];

        const oldLevel = userData.level;



        const xp = Math.floor(
            Math.random() *
            (maxXp - minXp + 1)
        ) + minXp;

        userData.xp += xp;



        const newLevel = calculateLevel(
            userData.xp
        );

        userData.level = newLevel;



        saveData(data);



        if (newLevel > oldLevel) {

            await handleLevelUp(
                message,
                oldLevel,
                newLevel
            );
        }
    }
};



async function handleLevelUp(
    message,
    oldLevel,
    newLevel
) {

    const member = message.member;

    if (!member) return;



    const availableLevels = Object.keys(levelRoles)
        .map(Number)
        .filter(level => level <= newLevel)
        .sort((a, b) => b - a);

    const currentRoleLevel =
        availableLevels[0];


    if (currentRoleLevel) {

        const newRoleId =
            levelRoles[currentRoleLevel];

        if (newRoleId) {

            for (const roleLevel of Object.keys(levelRoles)) {

                const roleId =
                    levelRoles[roleLevel];

                if (
                    roleId &&
                    member.roles.cache.has(roleId) &&
                    roleId !== newRoleId
                ) {
                    await member.roles
                        .remove(roleId)
                        .catch(() => {});
                }
            }


            if (
                !member.roles.cache.has(newRoleId)
            ) {
                await member.roles
                    .add(newRoleId)
                    .catch(error => {
                        console.error(
                            'Failed to add level role:',
                            error
                        );
                    });
            }
        }
    }



    const channel =
        message.guild.channels.cache.get(
            levelUpChannelId
        );

    if (!channel) return;

    await channel.send(
        `<:40437star:1543606571563753523> ${message.author} **has just advanced to the next level! (${newLevel})** <:11268100:1543606582816936077>`
    );
}



module.exports.loadData = loadData;
module.exports.xpForLevel = xpForLevel;
module.exports.calculateLevel = calculateLevel;
