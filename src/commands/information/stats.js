/** @format */

import { Command } from '../../classes/abstract/command.js';
import { paginator } from '../../utils/paginator.js';

export default class Stats extends Command {
    constructor() {
        super(...arguments);
        this.aliases = ['status', 'statistics', 'info'];
        this.description = '📊 View detailed bot statistics';
    }

    execute = async (client, ctx) => {
        try {
            const pages = await this.getStatsPages(client, ctx);
            await paginator(ctx, pages);
        } catch (error) {
            client.log(`Stats command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to fetch statistics!`)]
            }).catch(() => {});
        }
    };

    async getStatsPages(client, ctx) {
        const totalUsers = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
        const cpuUsage = (await import('os-utils')).default.cpuUsage;
        const _cpuUsage = await new Promise((resolve) => cpuUsage(resolve));

        const memUsage = process.memoryUsage();
        const memPercent = ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1);

        const generalStatsEmbed = client.embed()
            .setColor('#5865F2')
            .setAuthor({
                name: `${client.user.username} Statistics`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTitle(`${client.emoji.info} General Statistics`)
            .setDescription(
                `**Bot Statistics**\n` +
                `${client.emoji.check} **Servers:** ${client.guilds.cache.size.toLocaleString()}\n` +
                `${client.emoji.check} **Users:** ${totalUsers.toLocaleString()}\n` +
                `${client.emoji.check} **Channels:** ${client.channels.cache.size.toLocaleString()}\n` +
                `${client.emoji.check} **Commands:** ${client.commands.size}\n\n` +
                `**Performance**\n` +
                `${client.emoji.timer} **Uptime:** ${client.formatDuration(client.uptime)}\n` +
                `${client.emoji.timer} **Latency:** ${client.ws.ping}ms\n` +
                `${client.emoji.info} **Memory:** ${client.formatBytes(memUsage.heapUsed)} / ${client.formatBytes(memUsage.heapTotal)} (${memPercent}%)\n\n` +
                `**Shard Information**\n` +
                `${client.emoji.info} **Current Shard:** ${ctx.guild?.shardId || 0}\n` +
                `${client.emoji.info} **Total Shards:** ${client.ws.totalShards || 1}`
            )
            .setFooter({ text: `Page 1/3 • Requested by ${ctx.author.tag}` })
            .setTimestamp();

        let shardDescription;
        try {
            const shardInfo = await client.cluster.broadcastEval(
                (c) => `${client.emoji.check} Shard ${c.ws.shards.first().id} - ${c.ws.ping}ms - ${c.guilds.cache.size} servers`
            );
            shardDescription = shardInfo.join('\n') || `${client.emoji.warn} No shard info available`;
        } catch {
            shardDescription = `${client.emoji.info} Shard ${ctx.guild?.shardId || 0} - ${client.ws.ping}ms`;
        }

        const shardInfoEmbed = client.embed()
            .setColor('#5865F2')
            .setAuthor({
                name: `${client.user.username} Statistics`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTitle(`${client.emoji.info} Shard Information`)
            .setDescription(shardDescription)
            .setFooter({ text: `Page 2/3 • Requested by ${ctx.author.tag}` })
            .setTimestamp();

        const systemInfoEmbed = client.embed()
            .setColor('#5865F2')
            .setAuthor({
                name: `${client.user.username} Statistics`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTitle(`${client.emoji.info} System Information`)
            .setDescription(
                `**Resource Usage**\n` +
                `${client.emoji.info} **CPU Usage:** ${(_cpuUsage * 100).toFixed(2)}%\n` +
                `${client.emoji.info} **RSS Memory:** ${client.formatBytes(memUsage.rss)}\n` +
                `${client.emoji.info} **Heap Used:** ${client.formatBytes(memUsage.heapUsed)}\n` +
                `${client.emoji.info} **Heap Total:** ${client.formatBytes(memUsage.heapTotal)}\n` +
                `${client.emoji.info} **External:** ${client.formatBytes(memUsage.external)}\n\n` +
                `**System Details**\n` +
                `${client.emoji.check} **Platform:** ${process.platform}\n` +
                `${client.emoji.check} **Architecture:** ${process.arch}\n` +
                `${client.emoji.check} **Node.js:** ${process.version}\n` +
                `${client.emoji.check} **Discord.js:** v${(await import('discord.js')).version}`
            )
            .setFooter({ text: `Page 3/3 • Requested by ${ctx.author.tag}` })
            .setTimestamp();

        return [generalStatsEmbed, shardInfoEmbed, systemInfoEmbed];
    }
}