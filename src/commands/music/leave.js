/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Leave extends Command {
    constructor() {
        super(...arguments);
        this.player = true;
        this.inSameVC = true;
        this.aliases = ['dc', 'disconnect', 'bye'];
        this.description = '👋 Disconnect bot from voice channel';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            const has247 = await client.db?.twoFourSeven.has(ctx.guild.id);
            
            if (player) {
                await player.destroy();
            }
            
            await ctx.guild.members.me.voice.disconnect();

            const embed = client.embed()
                .setColor('#ED4245')
                .setTitle(`${client.emoji.check} Disconnected`)
                .setDescription(
                    `${client.emoji.check} Successfully disconnected from voice channel\n` +
                    `${client.emoji.info} Player destroyed and queue cleared\n\n` +
                    (has247 ? 
                        `${client.emoji.warn} **24/7 Mode is Enabled**\n` +
                        `The bot will reconnect automatically.\n` +
                        `Use \`${client.prefix}247\` to disable.` :
                        `${client.emoji.info} Use \`${client.prefix}join\` to reconnect`
                    )
                )
                .setFooter({ text: `Disconnected by ${ctx.author.tag}` });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`Leave command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to disconnect!`)]
            }).catch(() => {});
        }
    };
}
