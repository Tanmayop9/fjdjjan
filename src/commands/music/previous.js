/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Previous extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['prev', 'back', 'rewind'];
        this.description = '⏮️ Play the previous track';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            const previousTrack = player.queue.previous.pop();
            
            if (!previousTrack) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} No previous tracks available!\n\n${client.emoji.info} This is the first track in history.`)
                    ],
                });
            }

            const currentTrack = player.queue.current;
            player.queue.unshift(currentTrack);
            player.queue.unshift(previousTrack);
            await player.shoukaku.stopTrack();
            player.queue.previous.pop();

            const embed = client.embed()
                .setColor('#57F287')
                .setTitle(`${client.emoji.previous} Playing Previous Track`)
                .setDescription(
                    `**Now Playing:**\n${client.emoji.check} ${previousTrack.title}\n\n` +
                    `${client.emoji.info} **Artist:** ${previousTrack.author}\n` +
                    `${client.emoji.timer} **Duration:** ${previousTrack.isStream ? '🔴 LIVE' : client.formatDuration(previousTrack.length)}\n\n` +
                    `${client.emoji.info} Use \`${client.prefix}previous\` again to go back further`
                );

            if (previousTrack.thumbnail) {
                embed.setThumbnail(previousTrack.thumbnail);
            }

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Previous command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to play previous track!`)]
            }).catch(() => {});
        }
    };
}
