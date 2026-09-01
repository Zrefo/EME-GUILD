const {
    SlashCommandBuilder,
    AttachmentBuilder
} = require('discord.js');

const {
    createCanvas,
    loadImage,
    GlobalFonts
} = require('@napi-rs/canvas');

const fs = require('fs');
const path = require('path');

const dataPath = path.join(
    __dirname,
    '..',
    'data',
    'levels.json'
);

const backgroundPath = path.join(
    __dirname,
    '..',
    'assets',
    'level-background.png'
);

const fontPath = path.join(
    __dirname,
    '..',
    'assets',
    'Minecraft.ttf'
);



if (fs.existsSync(fontPath)) {
    GlobalFonts.registerFromPath(
        fontPath,
        'Minecraft'
    );
}



function xpForLevel(level) {
    return Math.floor(
        100 * Math.pow(level, 1.5)
    );
}



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



module.exports = {

    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your guild rank.'),

    async execute(interaction) {

        const target = interaction.user;

        const data = loadData();

        const users = data.users;



        const userData =
            users[target.id] || {
                xp: 0,
                level: 0
            };

        const currentLevel =
            userData.level;

        const currentLevelXp =
            xpForLevel(currentLevel);

        const nextLevelXp =
            xpForLevel(currentLevel + 1);

        const xpIntoLevel =
            Math.max(
                0,
                userData.xp - currentLevelXp
            );

        const xpNeeded =
            nextLevelXp - currentLevelXp;

        const progress =
            Math.min(
                1,
                xpIntoLevel / xpNeeded
            );



        const ranking =
            Object.entries(users)
                .sort((a, b) => {

                    if (
                        b[1].level !==
                        a[1].level
                    ) {
                        return (
                            b[1].level -
                            a[1].level
                        );
                    }

                    return (
                        b[1].xp -
                        a[1].xp
                    );
                });

        const rank =
            Math.max(
                1,
                ranking.findIndex(
                    ([id]) =>
                        id === target.id
                ) + 1
            );



        const canvas =
            createCanvas(
                930,
                280
            );

        const ctx =
            canvas.getContext('2d');



        const background =
            await loadImage(
                backgroundPath
            );

        ctx.drawImage(
            background,
            0,
            0,
            930,
            280
        );



        const avatarUrl =
            target.displayAvatarURL({
                extension: 'png',
                size: 256
            });

        const avatar =
            await loadImage(
                avatarUrl
            );

        const avatarSize = 110;

        const avatarX =
            (930 - avatarSize) / 2;

        const avatarY = 78;


        ctx.save();

        ctx.beginPath();

        ctx.arc(
            avatarX + avatarSize / 2,
            avatarY + avatarSize / 2,
            avatarSize / 2,
            0,
            Math.PI * 2
        );

        ctx.closePath();

        ctx.clip();

        ctx.drawImage(
            avatar,
            avatarX,
            avatarY,
            avatarSize,
            avatarSize
        );

        ctx.restore();



        ctx.font =
            'bold 30px Arial';

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';

        ctx.save();

        ctx.shadowColor =
            'rgba(0, 0, 0, 0.90)';

        ctx.shadowBlur = 10;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

        ctx.fillStyle =
            '#FF69B4';

        ctx.fillText(
            target.displayName,
            465,
            50
        );

        ctx.restore();



        const barWidth = 300;

        const barHeight = 20;

        const barX =
            (930 - barWidth) / 2;

        const barY = 205;

        const radius = 10;


        ctx.fillStyle =
            '#BDBDBD';

        drawRoundedRect(
            ctx,
            barX,
            barY,
            barWidth,
            barHeight,
            radius
        );


        if (progress > 0) {

            const progressWidth =
                Math.max(
                    barHeight,
                    barWidth * progress
                );

            ctx.fillStyle =
                '#F5F5F5';

            drawRoundedRect(
                ctx,
                barX,
                barY,
                progressWidth,
                barHeight,
                radius
            );
        }



        ctx.font =
            '24px Minecraft';

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';



        ctx.save();

        ctx.shadowColor =
            'rgba(0, 0, 0, 0.75)';

        ctx.shadowBlur = 8;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

        ctx.fillStyle =
            '#E8E8E8';

        ctx.fillText(
            `RANK: #${rank}`,
            170,
            145
        );

        ctx.restore();



        ctx.save();

        ctx.shadowColor =
            'rgba(0, 0, 0, 0.75)';

        ctx.shadowBlur = 8;

        ctx.shadowOffsetX = 3;

        ctx.shadowOffsetY = 3;

        ctx.fillStyle =
            '#E8E8E8';

        ctx.fillText(
            `LEVEL: ${currentLevel}`,
            760,
            145
        );

        ctx.restore();



        ctx.font =
            '16px Minecraft';

        ctx.save();

        ctx.shadowColor =
            'rgba(0, 0, 0, 0.70)';

        ctx.shadowBlur = 7;

        ctx.shadowOffsetX = 2;

        ctx.shadowOffsetY = 2;

        ctx.fillStyle =
            '#E8E8E8';

        ctx.fillText(
            `${xpIntoLevel} / ${xpNeeded} XP`,
            465,
            235
        );

        ctx.restore();



        const attachment =
            new AttachmentBuilder(
                await canvas.encode('png'),
                {
                    name: 'rank.png'
                }
            );



        await interaction.reply({
            files: [attachment]
        });
    }
};



function drawRoundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();

    ctx.moveTo(
        x + radius,
        y
    );

    ctx.lineTo(
        x + width - radius,
        y
    );

    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );

    ctx.lineTo(
        x + width,
        y + height - radius
    );

    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );

    ctx.lineTo(
        x + radius,
        y + height
    );

    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );

    ctx.lineTo(
        x,
        y + radius
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );

    ctx.closePath();

    ctx.fill();
}
