/** @format */

import { Command } from '../../classes/abstract/command.js';
import { updatePlayerButtons } from '../../functions/updatePlayerButtons.js';

export default class Pause extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['stop-temp', 'hold'];
        this.description = '⏸️ Pause the current track';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            if (!player.playing) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} The player is already paused!\n\n${client.emoji.info} Use \`${client.prefix}resume\` to continue playback.`)
                    ],
                });
            }

            const track = player.queue.current;
            player.pause(true);
            await updatePlayerButtons(client, player);

            const embed = client.embed()
                .setColor('#FEE75C')
                .setTitle(`${client.emoji.pause} Playback Paused`)
                .setDescription(
                    `**Track:** ${track?.title || 'Unknown'}\n\n` +
                    `${client.emoji.info} Use \`${client.prefix}resume\` to continue\n` +
                    `${client.emoji.timer} Paused by ${ctx.author.tag}`
                );

            if (track?.thumbnail) embed.setThumbnail(track.thumbnail);

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Pause command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to pause playback!`)]
            }).catch(() => {});
        }
    };
}
