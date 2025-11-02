const { SlashCommandBuilder, EmbedBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user!')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user whose avatar you want to see')
                .setRequired(false))
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });

        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle(`🖼️ ${targetUser.username}'s Avatar`)
            .setImage(avatarURL)
            .setDescription(`[Download Avatar](${avatarURL})`)
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
