/**
 * Enhanced Music Manager with advanced features
 * @class Manager
 */
import apple from 'kazagumo-apple';
import deezer from 'kazagumo-deezer';
import { Connectors } from 'shoukaku';
import spotify from 'kazagumo-spotify';
import { Kazagumo, Plugins } from 'kazagumo';
import { autoplay } from '../functions/autoplay.js';
import { config } from './config.js';

export class Manager {
    static init(client) {
        // Get Lavalink configuration
        const lavalinkNodes = [{
            secure: config.lavalink.secure,
            auth: config.lavalink.password,
            url: `${config.lavalink.host}:${config.lavalink.port}`,
            name: 'nerox-lava-primary',
        }];

        // Configure plugins
        const plugins = [
            new deezer(),
            new apple({
                imageWidth: 600,
                imageHeight: 900,
                countryCode: 'us',
            }),
            new Plugins.PlayerMoved(client),
        ];

        // Add Spotify plugin if credentials are provided
        if (config.spotify.clientId && config.spotify.clientSecret) {
            plugins.push(new spotify({
                searchLimit: 10,
                albumPageLimit: 1,
                searchMarket: 'IN',
                playlistPageLimit: 1,
                clientId: config.spotify.clientId,
                clientSecret: config.spotify.clientSecret,
            }));
        } else {
            client.log('⚠️ Spotify credentials not found, Spotify features disabled', 'warn');
        }

        const manager = new Kazagumo({
            plugins,
            defaultSearchEngine: 'youtube',
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId);
                if (guild?.shard) {
                    guild.shard.send(payload);
                }
            },
        }, new Connectors.DiscordJS(client), lavalinkNodes, {
            userAgent: `@nerox/v2.0.0`,
        });

        // Enhanced event handlers with better error handling
        manager.on('playerStuck', async (player) => {
            client.log(`Player stuck in guild ${player.guildId}`, 'warn');
            try {
                await player.destroy();
            } catch (error) {
                client.log(`Error destroying stuck player: ${error.message}`, 'error');
            }
        });

        manager.on('playerException', async (player, exception) => {
            client.log(`Player exception in guild ${player.guildId}: ${exception.message}`, 'error');
            try {
                await player.destroy();
            } catch (error) {
                client.log(`Error destroying player after exception: ${error.message}`, 'error');
            }
        });

        manager.on('playerStart', (...args) => client.emit('trackStart', ...args));
        manager.on('playerDestroy', (...args) => client.emit('playerDestroy', ...args));

        manager.shoukaku.on('error', (node, error) => {
            client.log(`Lavalink node ${node} error: ${error.message}`, 'error');
        });

        manager.shoukaku.on('ready', (name) => {
            client.log(`🎵 Lavalink node: ${name} connected`, 'success');
        });

        manager.shoukaku.on('disconnect', (name, moved) => {
            client.log(`Lavalink node: ${name} disconnected${moved ? ' (moved)' : ''}`, 'warn');
        });

        manager.shoukaku.on('reconnecting', (name) => {
            client.log(`Lavalink node: ${name} reconnecting...`, 'info');
        });

        // Track end - cleanup
        manager.on('playerEnd', async (player) => {
            try {
                const playEmbed = player.data.get('playEmbed');
                if (playEmbed) {
                    await playEmbed.delete().catch(() => {});
                }
            } catch (error) {
                // Silently fail
            }
        });

        // Queue end - autoplay or destroy
        manager.on('playerEmpty', async (player) => {
            const autoplayEnabled = player.data.get('autoplayStatus');
            try {
                if (autoplayEnabled) {
                    await autoplay(client, player);
                } else {
                    await player.destroy();
                }
            } catch (error) {
                client.log(`Error handling empty player: ${error.message}`, 'error');
                await player.destroy().catch(() => {});
            }
        });

        return manager;
    }
}
