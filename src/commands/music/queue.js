/** @format */

import _ from 'lodash';
import { paginator } from '../../utils/paginator.js';
import { Command } from '../../classes/abstract/command.js';

export default class Queue extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.aliases = ['q', 'list', 'tracks'];
        this.description = '📜 View the music queue with pagination';
    }

    execute = async (client, ctx) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            if (!player.queue.current && player.queue.length === 0) {
                return ctx.reply({
                    embeds: [
                        client.embed()
                            .setColor('#FEE75C')
                            .desc(`${client.emoji.warn} The queue is empty!\n\n${client.emoji.info} Use \`${client.prefix}play <query>\` to add tracks.`)
                    ]
                });
            }

            const formatTrack = (t, i, isCurrent = false) => {
                const title = t.title.length > 35 ? t.title.substring(0, 32) + '...' : t.title;
                const duration = t.isStream ? '🔴 LIVE' : client.formatDuration(t.length);
                const prefix = isCurrent ? `${client.emoji.check}` : `\`${i + 1}.\``;
                return `${prefix} **${title}**\n   ↳ ${duration} • by ${t.author}\n`;
            };

            const previous = player.queue.previous.map((t, i) => formatTrack(t, i));
            const current = formatTrack(player.queue.current, player.queue.previous.length, true);
            const upcoming = player.queue.map((t, i) => 
                formatTrack(t, i + player.queue.previous.length + 1)
            );

            const queuedSongs = [...previous, current, ...upcoming];
            const mapping = _.chunk(queuedSongs, 10);
            const descriptions = mapping.map((s) => s.join(''));
            
            const totalDuration = [...player.queue.previous, player.queue.current, ...player.queue]
                .filter(t => !t.isStream)
                .reduce((acc, t) => acc + (t.length || 0), 0);

            const pages = descriptions.map((desc, i) => {
                return client.embed()
                    .setColor('#5865F2')
                    .setTitle(`${client.emoji.info} Music Queue`)
                    .setDescription(desc)
                    .setFooter({ 
                        text: `Page ${i + 1}/${descriptions.length} • ${player.queue.length} tracks in queue • ${client.formatDuration(totalDuration)} total` 
                    });
            });

            if (pages.length === 0) {
                pages.push(
                    client.embed()
                        .setColor('#5865F2')
                        .setTitle(`${client.emoji.info} Music Queue`)
                        .setDescription(current)
                        .setFooter({ text: 'No other tracks in queue' })
                );
            }

            await paginator(ctx, pages, Math.floor(previous.length / 10) || 0);
        } catch (error) {
            client.log(`Queue command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to fetch queue!`)]
            }).catch(() => {});
        }
    };
}
