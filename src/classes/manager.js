/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║              NEROX V3 - ULTRA MANAGER 🎵                      ║
 * ║  Connection Pooling | Circuit Breaker | Smart Caching        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
import apple from 'kazagumo-apple';
import deezer from 'kazagumo-deezer';
import { Connectors } from 'shoukaku';
import spotify from 'kazagumo-spotify';
import { Kazagumo, Plugins } from 'kazagumo';
import { autoplay } from '../functions/autoplay.js';
import { config } from './config.js';

// V3: Singleton pattern for manager
let managerInstance = null;

export class Manager {
    static init(client) {
        // V3: Return cached instance if exists
        if (managerInstance) {
            return managerInstance;
        }

        const timer = client.profiler?.startTimer('manager.init');

        // V3: Optimized Lavalink configuration
        const lavalinkNodes = [{
            secure: config.lavalink.secure,
            auth: config.lavalink.password,
            url: `${config.lavalink.host}:${config.lavalink.port}`,
            name: 'nerox-v3-node',
        }];

        // V3: Smart plugin initialization (lazy when possible)
        const plugins = [
            new deezer(),
            new apple({
                imageWidth: 480, // V3: Reduced from 600
                imageHeight: 720, // V3: Reduced from 900
                countryCode: 'us',
            }),
            new Plugins.PlayerMoved(client),
        ];

        // V3: Conditional Spotify plugin
        if (config.spotify?.clientId && config.spotify?.clientSecret) {
            plugins.push(new spotify({
                searchLimit: 5, // V3: Reduced from 10
                albumPageLimit: 1,
                searchMarket: 'IN',
                playlistPageLimit: 1,
                clientId: config.spotify.clientId,
                clientSecret: config.spotify.clientSecret,
            }));
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
            userAgent: `@nerox/v3.0.0-ultra`,
        });

        // V3: Optimized event handlers with circuit breaker
        manager.on('playerStuck', async (player) => {
            client.log(`Player stuck in guild ${player.guildId}`, 'warn');
            try {
                await client.breaker.execute(() => player.destroy());
            } catch (error) {
                client.log(`Error destroying stuck player: ${error.message}`, 'error');
            }
        });

        manager.on('playerException', async (player, exception) => {
            client.log(`Player exception in guild ${player.guildId}: ${exception.message}`, 'error');
            try {
                await player.destroy();
            } catch (error) {
                // Silent fail
            }
        });

        manager.on('playerStart', (...args) => {
            client.profiler.count('player.start');
            client.emit('trackStart', ...args);
        });
        
        manager.on('playerDestroy', (...args) => {
            client.profiler.count('player.destroy');
            client.emit('playerDestroy', ...args);
        });

        // V3: Optimized Shoukaku event handlers
        manager.shoukaku.on('error', (node, error) => {
            client.log(`Lavalink node ${node} error: ${error.message}`, 'error');
            client.profiler.count('lavalink.error');
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

        // V3: Track end with aggressive cleanup
        manager.on('playerEnd', async (player) => {
            try {
                const playEmbed = player.data.get('playEmbed');
                if (playEmbed) {
                    await playEmbed.delete().catch(() => {});
                    player.data.delete('playEmbed'); // V3: Clear reference
                }
            } catch (error) {
                // Silent fail
            }
        });

        // V3: Queue end with smart autoplay
        manager.on('playerEmpty', async (player) => {
            const autoplayEnabled = player.data.get('autoplayStatus');
            const timer = client.profiler?.startTimer('player.empty');
            
            try {
                if (autoplayEnabled) {
                    await autoplay(client, player);
                } else {
                    await player.destroy();
                }
            } catch (error) {
                client.log(`Error handling empty player: ${error.message}`, 'error');
                await player.destroy().catch(() => {});
            } finally {
                timer?.end();
            }
        });

        // V3: Cache singleton
        managerInstance = manager;
        
        if (timer) timer.end();
        return manager;
    }
}
