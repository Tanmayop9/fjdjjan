const { SlashCommandBuilder, EmbedBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Grab user information (for fun)!')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get info about')
                .setRequired(false))
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const member = interaction.guild ? await interaction.guild.members.fetch(targetUser.id).catch(() => null) : null;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📋 User Information for ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Username', value: targetUser.username, inline: true },
                { name: '🔢 Discriminator', value: targetUser.discriminator === '0' ? 'None (New Username System)' : `#${targetUser.discriminator}`, inline: true },
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '🤖 Bot?', value: targetUser.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: false },
            );

        // Add server-specific info if available
        if (member) {
            embed.addFields(
                { name: '📆 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'None' : 'None', inline: false },
                { name: '🎨 Display Color', value: member.displayHexColor, inline: true },
            );

            if (member.nickname) {
                embed.addFields({ name: '📝 Nickname', value: member.nickname, inline: true });
            }
        }

        // Add status badges
        const badges = [];
        if (targetUser.bot) badges.push('🤖 Bot');
        if (targetUser.system) badges.push('🔧 System');
        
        if (badges.length > 0) {
            embed.addFields({ name: '🏅 Badges', value: badges.join(' • '), inline: false });
        }

        embed.setFooter({ text: 'User info grabbed successfully!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
