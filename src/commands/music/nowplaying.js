/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class NowPlaying extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['now', 'np', 'current', 'playing'];
        this.description = '🎵 Display current track information';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            const track = player.queue.current;
            
            if (!track) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} No track is currently playing!`)
                    ]
                });
            }

            const position = player.shoukaku.position || 0;
            const duration = track.length || 0;
            const progress = duration > 0 ? Math.floor((position / duration) * 20) : 0;
            const progressBar = `${client.emoji.check}${'▬'.repeat(progress)}${'▬'.repeat(20 - progress)}`;

            const embed = client.embed()
                .setColor('#5865F2')
                .setTitle(`${client.emoji.info} Now Playing`)
                .setDescription(
                    `**${track.title}**\n\n` +
                    `${client.emoji.info} **Artist:** ${track.author}\n` +
                    `${client.emoji.timer} **Duration:** ${track.isStream ? `${client.emoji.check} LIVE Stream` : client.formatDuration(duration)}\n` +
                    `${client.emoji.check} **Requested by:** ${track.requester?.displayName || 'Unknown'}\n\n` +
                    `**Progress:**\n${progressBar}\n` +
                    `\`${client.formatDuration(position)} / ${track.isStream ? '∞' : client.formatDuration(duration)}\`\n\n` +
                    `${client.emoji.info} **Queue:** ${player.queue.length} track${player.queue.length !== 1 ? 's' : ''} remaining\n` +
                    `${player.data.get('autoplayStatus') ? `${client.emoji.autoplay} Autoplay: Enabled` : ''}`
                )
                .setFooter({ 
                    text: `Volume: ${player.volume}% • Loop: ${player.loop || 'Off'} • Shard: ${ctx.guild?.shardId || 0}` 
                });

            if (track.thumbnail) {
                embed.setThumbnail(track.thumbnail);
            }

            if (track.uri) {
                embed.setURL(track.uri);
            }

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            client.log(`NowPlaying command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to fetch track information!`)]
            }).catch(() => {});
        }
    };
}
