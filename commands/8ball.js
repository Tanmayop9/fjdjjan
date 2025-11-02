const { SlashCommandBuilder, ApplicationIntegrationType, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the 8-ball')
                .setRequired(true))
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]),
    
    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        const responses = [
            '🔮 It is certain.',
            '🔮 It is decidedly so.',
            '🔮 Without a doubt.',
            '🔮 Yes, definitely.',
            '🔮 You may rely on it.',
            '🔮 As I see it, yes.',
            '🔮 Most likely.',
            '🔮 Outlook good.',
            '🔮 Yes.',
            '🔮 Signs point to yes.',
            '🔮 Reply hazy, try again.',
            '🔮 Ask again later.',
            '🔮 Better not tell you now.',
            '🔮 Cannot predict now.',
            '🔮 Concentrate and ask again.',
            '🔮 Don\'t count on it.',
            '🔮 My reply is no.',
            '🔮 My sources say no.',
            '🔮 Outlook not so good.',
            '🔮 Very doubtful.',
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        await interaction.reply(`**Question:** ${question}\n**Answer:** ${answer}`);
    },
};
