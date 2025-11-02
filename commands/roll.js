const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a dice!')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default: 6)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(100))
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]),
    
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        
        await interaction.reply(`🎲 You rolled a **${result}** on a ${sides}-sided dice!`);
    },
};
