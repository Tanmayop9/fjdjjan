/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Stop extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['disconnect', 'dc', 'leave'];
        this.description = '⏹️ Stop playback and disconnect';
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
                .setTitle(`${client.emoji.stop} Playback Stopped`)
                .setDescription(
                    `${client.emoji.check} Player destroyed and disconnected\n` +
                    `${client.emoji.info} Queue cleared\n\n` +
                    (has247 ? `${client.emoji.warn} **24/7 Mode Enabled**\nThe bot will rejoin automatically.\nUse \`${client.prefix}247\` to disable.` : 
                    `${client.emoji.info} Use \`${client.prefix}play\` to start again`)
                )
                .setFooter({ text: `Stopped by ${ctx.author.tag}` });

            await ctx.reply({ embeds: [embed] });

            if (client.healthCheck) {
                client.healthCheck.incrementMetric('playersStopped');
            }
        } catch (error) {
            client.log(`Stop command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to stop playback!`)]
            }).catch(() => {});
        }
    };
}
