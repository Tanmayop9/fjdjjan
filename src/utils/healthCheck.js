/**
 * Health Check and Monitoring System
 * Provides real-time bot health metrics and status
 */
import os from 'os';
import { log } from '../logger.js';

export class HealthCheck {
    constructor(client) {
        this.client = client;
        this.startTime = Date.now();
        this.metrics = {
            commandsExecuted: 0,
            errorsEncountered: 0,
            songsPlayed: 0,
            messagesProcessed: 0,
        };
    }

    /**
     * Get current bot health status
     * @returns {Object} Health status object
     */
    getHealth() {
        const uptime = Date.now() - this.startTime;
        const memoryUsage = process.memoryUsage();
        
        return {
            status: 'healthy',
            uptime: uptime,
            uptimeFormatted: this.formatUptime(uptime),
            timestamp: Date.now(),
            bot: {
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                channels: this.client.channels.cache.size,
                commands: this.client.commands.size,
                ws: {
                    ping: this.client.ws.ping,
                    status: this.getWSStatus(),
                },
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memory: {
                    heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
                    heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
                    external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB',
                    rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
                },
                cpu: {
                    cores: os.cpus().length,
                    model: os.cpus()[0]?.model || 'Unknown',
                    usage: this.getCPUUsage(),
                },
                loadAverage: os.loadavg(),
            },
            metrics: this.metrics,
            music: {
                activePlayers: this.client.manager?.players?.size || 0,
                totalTracks: this.getTotalQueuedTracks(),
            },
        };
    }

    /**
     * Get WebSocket connection status
     */
    getWSStatus() {
        const status = this.client.ws.status;
        const statuses = ['READY', 'CONNECTING', 'RECONNECTING', 'IDLE', 'NEARLY', 'DISCONNECTED', 'WAITING_FOR_GUILDS', 'IDENTIFYING', 'RESUMING'];
        return statuses[status] || 'UNKNOWN';
    }

    /**
     * Get CPU usage percentage
     */
    getCPUUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~(100 * idle / total);
        
        return `${usage}%`;
    }

    /**
     * Get total tracks queued across all players
     */
    getTotalQueuedTracks() {
        if (!this.client.manager?.players) return 0;
        
        let total = 0;
        for (const player of this.client.manager.players.values()) {
            total += player.queue?.size || 0;
        }
        return total;
    }

    /**
     * Format uptime in human-readable format
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    }

    /**
     * Increment metric counter
     */
    incrementMetric(metric) {
        if (this.metrics.hasOwnProperty(metric)) {
            this.metrics[metric]++;
        }
    }

    /**
     * Perform health check and log warnings
     */
    performCheck() {
        const health = this.getHealth();
        
        // Check memory usage
        const heapUsed = parseFloat(health.system.memory.heapUsed);
        if (heapUsed > 1024) { // 1GB
            log(`⚠️ High memory usage: ${health.system.memory.heapUsed}`, 'warn');
        }

        // Check WebSocket ping
        if (health.bot.ws.ping > 200) {
            log(`⚠️ High WebSocket latency: ${health.bot.ws.ping}ms`, 'warn');
        }

        // Check if disconnected
        if (health.bot.ws.status === 'DISCONNECTED') {
            log('❌ WebSocket disconnected!', 'error');
        }

        return health;
    }

    /**
     * Start periodic health checks
     */
    startPeriodicChecks(intervalMinutes = 5) {
        setInterval(() => {
            this.performCheck();
        }, intervalMinutes * 60 * 1000);
        
        log(`✅ Health check monitoring started (every ${intervalMinutes} minutes)`, 'info');
    }
}
