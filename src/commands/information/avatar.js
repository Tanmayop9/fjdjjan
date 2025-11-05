/** @format */

import { Command } from '../../classes/abstract/command.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default class Avatar extends Command {
	constructor() {
		super(...arguments);
		this.aliases = ['av', 'pfp', 'picture'];
		this.description = '✨ Display stunning high-res avatars with interactive UI';
		this.usage = '[user]';
	}

	execute = async (client, ctx) => {
		try {
			const target = ctx.mentions.users.first() || ctx.author;
			const member = ctx.guild?.members.cache.get(target.id);
			
			if (!target) {
				return ctx.reply({
					embeds: [client.embed().desc(`${client.emoji.cross} User not found!`)]
				});
			}
			
			const userAvatar = target.displayAvatarURL({ extension: 'png', size: 4096 });
			const serverAvatar = member?.avatar
				? member.displayAvatarURL({ extension: 'png', size: 4096 })
				: null;

			const createEmbed = (url, title) => client.embed()
				.setTitle(`${client.emoji.info} ${title}`)
				.setImage(url)
				.setColor('#5865F2')
				.setDescription(
					`**User:** ${target.tag}\n` +
					`**ID:** \`${target.id}\`\n\n` +
					`${client.emoji.check} [Download](${url}) • [Open in Browser](${url})`
				)
				.setTimestamp();

			const embed = createEmbed(userAvatar, `${target.username}'s Avatar`);

			if (serverAvatar && userAvatar !== serverAvatar) {
				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('user_avatar')
						.setLabel('👤 Global Avatar')
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder()
						.setCustomId('server_avatar')
						.setLabel('🏠 Server Avatar')
						.setStyle(ButtonStyle.Success)
				);

				const msg = await ctx.reply({ embeds: [embed], components: [row] });

				const collector = msg.createMessageComponentCollector({
					filter: (i) => i.user.id === ctx.author.id,
					time: 60000,
				});

				collector.on('collect', async (interaction) => {
					try {
						const isUserAvatar = interaction.customId === 'user_avatar';
						await interaction.update({
							embeds: [createEmbed(
								isUserAvatar ? userAvatar : serverAvatar,
								`${target.username}'s ${isUserAvatar ? 'Global' : 'Server'} Avatar`
							)],
						});
					} catch (err) {
						client.log(`Avatar interaction error: ${err.message}`, 'error');
					}
				});

				collector.on('end', () => {
					msg.edit({ components: [] }).catch(() => {});
				});
			} else {
				await ctx.reply({ embeds: [embed] });
			}
		} catch (error) {
			client.log(`Avatar command error: ${error.message}`, 'error');
			await ctx.reply({
				embeds: [client.embed().desc(`${client.emoji.cross} Failed to fetch avatar!`)]
			}).catch(() => {});
		}
	};
}