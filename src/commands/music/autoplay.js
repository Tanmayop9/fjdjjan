/** @format */

import { Command } from '../../classes/abstract/command.js';
import { updatePlayerButtons } from '../../functions/updatePlayerButtons.js';

export default class Autoplay extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['ap', 'auto'];
        this.description = '🔁 Toggle autoplay - automatically find similar tracks';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            const currentStatus = player.data.get('autoplayStatus') ? true : false;
            const newStatus = !currentStatus;

            if (newStatus) {
                player.data.set('autoplayStatus', true);
            } else {
                player.data.delete('autoplayStatus');
            }

            await updatePlayerButtons(client, player);

            const embed = client.embed()
                .setColor(newStatus ? '#57F287' : '#ED4245')
                .setTitle(`${client.emoji.autoplay} Autoplay ${newStatus ? 'Enabled' : 'Disabled'}`)
                .setDescription(
                    `${client.emoji.check} Autoplay has been **${newStatus ? 'enabled' : 'disabled'}**\n\n` +
                    (newStatus ? 
                        `${client.emoji.info} The bot will automatically find and play similar tracks when the queue ends\n` +
                        `${client.emoji.timer} Enjoy endless music!` :
                        `${client.emoji.info} The bot will stop when the queue is empty\n` +
                        `${client.emoji.timer} Manual track selection required`
                    )
                )
                .setFooter({ text: `${newStatus ? 'Enabled' : 'Disabled'} by ${ctx.author.tag}` });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Autoplay command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to toggle autoplay!`)]
            }).catch(() => {});
        }
    };
}
