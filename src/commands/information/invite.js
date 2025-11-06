/** @format */

import { ActionRowBuilder } from 'discord.js';
import { Command } from '../../classes/abstract/command.js';

export default class Invite extends Command {
    constructor() {
        super(...arguments);
        this.aliases = ['inv', 'add', 'support'];
        this.description = '🔗 Get bot invite and support links';
    }

    execute = async (client, ctx) => {
        try {
            const embed = client.embed()
                .setColor('#5865F2')
                .setTitle(`${client.emoji.info} Invite ${client.user.username}`)
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setDescription(
                    `${client.emoji.check} **Ready to add me to your server?**\n\n` +
                    `${client.emoji.info} **Administrator** - Full access (Recommended)\n` +
                    `${client.emoji.timer} **Basic Permissions** - Essential features only\n\n` +
                    `${client.emoji.check} Click a button below to get started!\n\n` +
                    `**Features:**\n` +
                    `🎵 High-quality music playback\n` +
                    `🎨 Modern interactive UI\n` +
                    `⚡ Lightning fast responses\n` +
                    `🔒 Secure and reliable\n\n` +
                    `**Support Server:** [Join here](https://discord.gg/your-support-server)`
                )
                .setFooter({ 
                    text: `Currently serving ${client.guilds.cache.size} servers` 
                })
                .setTimestamp();

            await ctx.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents([
                        client.button().link('⚡ Administrator', client.invite.admin()),
                        client.button().link('🎵 Basic', client.invite.required()),
                    ]),
                ],
            });
        } catch (error) {
            client.log(`Invite command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to generate invite links!`)]
            }).catch(() => {});
        }
    };
}
