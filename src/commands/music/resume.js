/** @format */

import { Command } from '../../classes/abstract/command.js';
import { updatePlayerButtons } from '../../functions/updatePlayerButtons.js';

export default class Resume extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['continue', 'unpause', 'play'];
        this.description = '▶️ Resume paused playback';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            if (!player.paused) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} The player is not paused!\n\n${client.emoji.info} Playback is already active.`)
                    ],
                });
            }

            const track = player.queue.current;
            player.pause(false);
            await updatePlayerButtons(client, player);

            const embed = client.embed()
                .setColor('#57F287')
                .setTitle(`${client.emoji.resume} Playback Resumed`)
                .setDescription(
                    `**Track:** ${track?.title || 'Unknown'}\n\n` +
                    `${client.emoji.check} Continuing playback\n` +
                    `${client.emoji.info} Resumed by ${ctx.author.tag}`
                );

            if (track?.thumbnail) embed.setThumbnail(track.thumbnail);

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Resume command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to resume playback!`)]
            }).catch(() => {});
        }
    };
}
