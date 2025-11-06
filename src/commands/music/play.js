
import { Command } from '../../classes/abstract/command.js';
import { RetryHandler } from '../../utils/retryHandler.js';

/**
 * Enhanced Play Command
 * Plays music with advanced validation and error handling
 */
export default class Play extends Command {
    constructor() {
        super(...arguments);
        this.inSameVC = true;
        this.aliases = ['p'];
        this.usage = '<query>';
        this.description = 'Play music using query';
        this.options = [
            {
                name: 'query',
                required: true,
                opType: 'string',
                isAutoComplete: true,
                description: 'what would you like to listen to ?',
            },
        ];
        this.execute = async (client, ctx, args) => {
            try {
                // Validate query
                if (!args.length) {
                    await ctx.reply({
                        embeds: [client.embed().desc(`${client.emoji.cross} Please provide a query.`)],
                    });
                    return;
                }

                const query = args.join(' ');
                const validation = client.validator.validateMusicQuery(query);
                
                if (!validation.valid) {
                    await ctx.reply({
                        embeds: [client.embed().desc(`${client.emoji.cross} ${validation.reason}`)],
                    });
                    return;
                }

                // Get or create player with retry logic
                const player = client.getPlayer(ctx) || await RetryHandler.execute(
                    async () => await client.manager.createPlayer({
                        deaf: true,
                        guildId: ctx.guild.id,
                        textId: ctx.channel.id,
                        shardId: ctx.guild.shardId,
                        voiceId: ctx.member.voice.channel.id,
                    }),
                    { maxRetries: 2, initialDelay: 500 }
                );

                const waitEmbed = await ctx.reply({
                    embeds: [
                        client
                            .embed()
                            .desc(`${client.emoji.timer} Searching for tracks...`),
                    ],
                });

                // Search with retry mechanism
                const result = await RetryHandler.execute(
                    async () => await player.search(validation.query, {
                        requester: ctx.author,
                    }),
                    {
                        maxRetries: 3,
                        initialDelay: 1000,
                        onRetry: (error, attempt) => {
                            client.log(`Play command search retry ${attempt}: ${error.message}`, 'warn');
                        }
                    }
                );

                if (!result.tracks.length) {
                    await waitEmbed.edit({
                        embeds: [client.embed().desc(`${client.emoji.cross} No results found.`)],
                    });
                    return;
                }

                const tracks = result.tracks;
                let addedCount = 0;

                if (result.type === 'PLAYLIST') {
                    for (const track of tracks) {
                        // Skip very short tracks (unless owner)
                        if (track.length && track.length < 30000 && !client.owners.includes(ctx.author.id)) {
                            continue;
                        }
                        player.queue.add(track);
                        addedCount++;
                    }
                } else {
                    // Validate track duration
                    if (tracks[0].length < 30000 && !client.owners.includes(ctx.author.id)) {
                        await waitEmbed.edit({
                            embeds: [
                                client
                                    .embed()
                                    .desc(`${client.emoji.cross} Songs shorter than 30s cannot be played.`),
                            ],
                        });
                        return;
                    }
                    player.queue.add(tracks[0]);
                    addedCount = 1;
                }

                if (addedCount === 0) {
                    await waitEmbed.edit({
                        embeds: [
                            client.embed().desc(`${client.emoji.cross} No valid tracks found in playlist.`)
                        ],
                    });
                    return;
                }

                const description = result.type === 'PLAYLIST' ?
                    `${client.emoji.check} Added \`${addedCount}\` tracks from \`${result.playlistName}\` to queue.`
                    : `${client.emoji.check} Added \`${tracks[0].title}\` to queue.`;

                if (!player.playing && !player.paused) {
                    player.play();
                }

                // Update statistics
                if (client.healthCheck) {
                    client.healthCheck.incrementMetric('commandsExecuted');
                }

                await waitEmbed.edit({
                    embeds: [client.embed().desc(description)],
                });
            } catch (error) {
                client.log(`Play command error: ${error.message}`, 'error');
                
                if (client.healthCheck) {
                    client.healthCheck.incrementMetric('errorsEncountered');
                }

                await ctx.reply({
                    embeds: [
                        client.embed().desc(
                            `${client.emoji.cross} An error occurred while playing: ${error.message}`
                        )
                    ],
                }).catch(() => {});
            }
        };
    }
}
