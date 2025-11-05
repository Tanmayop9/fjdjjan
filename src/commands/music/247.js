/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class TwoFourSeven extends Command {
    constructor() {
        super(...arguments);
        this.player = true;
        this.inSameVC = true;
        this.aliases = ['24/7', '24-7', 'alwayson'];
        this.description = '🔄 Toggle 24/7 mode - keep bot in voice channel';
    }

    execute = async (client, ctx) => {
        try {
            const currentStatus = await client.db.twoFourSeven.get(ctx.guild.id);
            
            if (currentStatus) {
                await client.db.twoFourSeven.delete(ctx.guild.id);
                
                const embed = client.embed()
                    .setColor('#ED4245')
                    .setTitle(`${client.emoji.check} 24/7 Mode Deactivated`)
                    .setDescription(
                        `${client.emoji.check} 24/7 mode has been **disabled**\n\n` +
                        `${client.emoji.info} The bot will now disconnect when inactive\n` +
                        `${client.emoji.info} All 24/7 configuration cleared`
                    )
                    .setFooter({ text: `Disabled by ${ctx.author.tag}` });

                await ctx.reply({ embeds: [embed] });
                return;
            }

            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} No active player! Join a voice channel and play music first.`)
                    ]
                });
            }

            await client.db.twoFourSeven.set(ctx.guild.id, {
                textId: player.textId,
                voiceId: player.voiceId,
            });

            const embed = client.embed()
                .setColor('#57F287')
                .setTitle(`${client.emoji.check} 24/7 Mode Activated`)
                .setDescription(
                    `${client.emoji.check} 24/7 mode has been **enabled**\n\n` +
                    `**Configuration:**\n` +
                    `${client.emoji.info} Text Channel: <#${player.textId}>\n` +
                    `${client.emoji.info} Voice Channel: <#${player.voiceId}>\n\n` +
                    `${client.emoji.timer} Bot will stay connected even when inactive`
                )
                .setFooter({ text: `Enabled by ${ctx.author.tag}` });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`247 command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to toggle 24/7 mode!`)]
            }).catch(() => {});
        }
    };
}