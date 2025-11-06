/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Skip extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['next', 's', 'sk'];
        this.description = '⏭️ Skip to the next track in queue';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            if (player.queue.length === 0 && !player.data.get('autoplayStatus')) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#ED4245')
                            .desc(`${client.emoji.cross} No more songs left in the queue to skip.\n\n${client.emoji.info} Try enabling autoplay with \`${client.prefix}autoplay\``)
                    ],
                });
            }

            const skipTrack = player.queue.current;
            
            if (!skipTrack) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No track is currently playing!`)]
                });
            }

            const nextTrack = player.queue[0];
            await player.shoukaku.stopTrack();

            const embed = client.embed()
                .setColor('#57F287')
                .setTitle(`${client.emoji.next} Track Skipped`)
                .setDescription(
                    `**Skipped:**\n${client.emoji.check} ${skipTrack.title}\n\n` +
                    (nextTrack ? `**Up Next:**\n${client.emoji.timer} ${nextTrack.title}` : 
                    player.data.get('autoplayStatus') ? `${client.emoji.autoplay} Autoplay will find next track` : 
                    `${client.emoji.info} Queue is empty`)
                );

            if (skipTrack.thumbnail) embed.setThumbnail(skipTrack.thumbnail);

            await ctx.reply({ embeds: [embed] });

            if (client.healthCheck) {
                client.healthCheck.incrementMetric('tracksSkipped');
            }
        } catch (error) {
            client.log(`Skip command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to skip track!`)]
            }).catch(() => {});
        }
    };
}
