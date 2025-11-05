/** @format */

import { Command } from '../../classes/abstract/command.js';

export default class Clear extends Command {
    constructor() {
        super(...arguments);
        this.playing = true;
        this.inSameVC = true;
        this.usage = '<queue/filters>';
        this.description = '🗑️ Clear queue or audio filters';
        this.options = [
            {
                name: 'op',
                required: true,
                opType: 'string',
                choices: [
                    { name: 'queue', value: 'q' },
                    { name: 'filters', value: 'f' },
                ],
                description: 'What to clear (queue or filters)',
            },
        ];
    }

    execute = async (client, ctx, args) => {
        try {
            const player = client.getPlayer(ctx);
            
            if (!player) {
                return ctx.reply({
                    embeds: [client.embed().desc(`${client.emoji.cross} No active player found!`)]
                });
            }

            const option = args[0]?.toLowerCase();

            switch (option) {
                case 'q':
                case 'queue': {
                    const queueLength = player.queue.length;
                    
                    if (queueLength === 0) {
                        return ctx.reply({
                            embeds: [
                                client.embed()
                                    .setColor('#FEE75C')
                                    .desc(`${client.emoji.warn} The queue is already empty!`)
                            ]
                        });
                    }

                    player.queue.clear();
                    
                    const embed = client.embed()
                        .setColor('#57F287')
                        .setTitle(`${client.emoji.check} Queue Cleared`)
                        .setDescription(
                            `${client.emoji.check} Removed \`${queueLength}\` track${queueLength !== 1 ? 's' : ''} from queue\n\n` +
                            `${client.emoji.info} Current track will continue playing`
                        )
                        .setFooter({ text: `Cleared by ${ctx.author.tag}` });

                    await ctx.reply({ embeds: [embed] });
                    break;
                }

                case 'f':
                case 'filters': {
                    const waitMsg = await ctx.reply({
                        embeds: [
                            client.embed()
                                .setColor('#5865F2')
                                .desc(`${client.emoji.timer} Clearing all audio filters...`)
                        ],
                    });

                    await player.shoukaku.clearFilters();
                    await client.sleep(3);

                    const embed = client.embed()
                        .setColor('#57F287')
                        .setTitle(`${client.emoji.check} Filters Cleared`)
                        .setDescription(
                            `${client.emoji.check} All audio filters have been removed\n\n` +
                            `${client.emoji.info} Audio restored to original quality`
                        )
                        .setFooter({ text: `Cleared by ${ctx.author.tag}` });

                    await waitMsg.edit({ embeds: [embed] });
                    break;
                }

                default:
                    await ctx.reply({
                        embeds: [
                            client.embed()
                                .setColor('#ED4245')
                                .desc(
                                    `${client.emoji.cross} Invalid option!\n\n` +
                                    `**Valid options:**\n` +
                                    `${client.emoji.info} \`queue\` or \`q\` - Clear the queue\n` +
                                    `${client.emoji.info} \`filters\` or \`f\` - Clear audio filters\n\n` +
                                    `**Example:** \`${client.prefix}clear queue\``
                                )
                        ],
                    });
                    break;
            }
        } catch (error) {
            client.log(`Clear command error: ${error.message}`, 'error');
            await ctx.reply({
                embeds: [client.embed().desc(`${client.emoji.cross} Failed to clear!`)]
            }).catch(() => {});
        }
    };
}
