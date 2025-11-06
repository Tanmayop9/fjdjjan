/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Volume extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['v', 'vol', 'sound'];
        this.description = '🔊 Adjust playback volume';
        this.options = [
            {
                name: 'volume',
                required: false,
                opType: 'string',
                description: 'Volume level (1-150%)',
            },
        ];
    }

    execute = async (client, ctx, args) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            if (!args[0]) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#5865F2')
                            .desc(`${client.emoji.info} **Current Volume:** \`${player.volume}%\`\n\n${client.emoji.info} Usage: \`${client.prefix}volume <1-150>\``)
                    ]
                });
            }

            const volume = Math.ceil(parseInt(args[0]));
            
            if (isNaN(volume) || volume < 1 || volume > 150) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#ED4245')
                            .desc(`${client.emoji.cross} Volume must be between \`1\` and \`150\`!\n\n${client.emoji.info} Example: \`${client.prefix}volume 80\``)
                    ],
                });
            }

            const oldVolume = player.volume;
            player.setVolume(volume);

            const volumeBar = '█'.repeat(Math.floor(volume / 10)) + '░'.repeat(15 - Math.floor(volume / 10));
            const volumeIcon = volume === 0 ? '🔇' : volume < 30 ? '🔈' : volume < 70 ? '🔉' : '🔊';

            const embed = client.embed()
                .setColor('#57F287')
                .setTitle(`${volumeIcon} Volume Adjusted`)
                .setDescription(
                    `${client.emoji.check} Volume set to \`${volume}%\`\n\n` +
                    `**Volume Bar:**\n\`${volumeBar}\` \`${volume}%\`\n\n` +
                    `${client.emoji.info} Previous: \`${oldVolume}%\` → New: \`${volume}%\``
                )
                .setFooter({ text: `Adjusted by ${ctx.author.tag}` });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Volume command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to adjust volume!`)]
            }).catch(() => {});
        }
    };
}
