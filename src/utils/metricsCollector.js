/**
 * Advanced Metrics Collector
 * Collects and aggregates bot performance metrics
 */
import { log } from '../logger.js';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export class MetricsCollector {
    constructor(client) {
        this.client = client;
        this.metrics = {
            commands: new Map(), // command name -> { count, errors, avgDuration }
            events: new Map(), // event name -> count
            music: {
                tracksPlayed: 0,
                totalDuration: 0,
                playersCreated: 0,
                playersDestroyed: 0,
            },
            api: {
                requests: 0,
                errors: 0,
                avgLatency: 0,
            },
            cache: {
                hits: 0,
                misses: 0,
            },
        };

        this.metricsDir = join(process.cwd(), 'metrics');
        if (!existsSync(this.metricsDir)) {
            mkdirSync(this.metricsDir, { recursive: true });
        }
    }

    /**
     * Record command execution
     */
    recordCommand(commandName, duration, success = true) {
        if (!this.metrics.commands.has(commandName)) {
            this.metrics.commands.set(commandName, {
                count: 0,
                errors: 0,
                totalDuration: 0,
                avgDuration: 0,
            });
        }

        const cmd = this.metrics.commands.get(commandName);
        cmd.count++;
        cmd.totalDuration += duration;
        cmd.avgDuration = cmd.totalDuration / cmd.count;
        
        if (!success) {
            cmd.errors++;
        }
    }

    /**
     * Record event
     */
    recordEvent(eventName) {
        const count = this.metrics.events.get(eventName) || 0;
        this.metrics.events.set(eventName, count + 1);
    }

    /**
     * Record music activity
     */
    recordMusicActivity(type, data = {}) {
        switch (type) {
            case 'trackPlayed':
                this.metrics.music.tracksPlayed++;
                if (data.duration) {
                    this.metrics.music.totalDuration += data.duration;
                }
                break;
            case 'playerCreated':
                this.metrics.music.playersCreated++;
                break;
            case 'playerDestroyed':
                this.metrics.music.playersDestroyed++;
                break;
        }
    }

    /**
     * Record API request
     */
    recordApiRequest(latency, success = true) {
        this.metrics.api.requests++;
        
        if (!success) {
            this.metrics.api.errors++;
        }

        // Calculate moving average
        const alpha = 0.1; // Smoothing factor
        this.metrics.api.avgLatency = 
            this.metrics.api.avgLatency * (1 - alpha) + latency * alpha;
    }

    /**
     * Record cache access
     */
    recordCacheAccess(hit = true) {
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
    }

    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            commands: Array.from(this.metrics.commands.entries()).map(([name, data]) => ({
                name,
                ...data,
                errorRate: data.count > 0 ? (data.errors / data.count * 100).toFixed(2) + '%' : '0%',
            })),
            events: Array.from(this.metrics.events.entries()).map(([name, count]) => ({
                name,
                count,
            })),
            music: this.metrics.music,
            api: {
                ...this.metrics.api,
                errorRate: this.metrics.api.requests > 0 
                    ? (this.metrics.api.errors / this.metrics.api.requests * 100).toFixed(2) + '%'
                    : '0%',
            },
            cache: {
                ...this.metrics.cache,
                hitRate: (this.metrics.cache.hits + this.metrics.cache.misses) > 0
                    ? (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses) * 100).toFixed(2) + '%'
                    : '0%',
            },
        };
    }

    /**
     * Get top commands by usage
     */
    getTopCommands(limit = 10) {
        return Array.from(this.metrics.commands.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([name, data]) => ({ name, count: data.count }));
    }

    /**
     * Export metrics to file
     */
    exportMetrics() {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = join(this.metricsDir, `metrics-${timestamp}.json`);
        
        const data = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            metrics: this.getMetrics(),
        };

        try {
            writeFileSync(filename, JSON.stringify(data, null, 2));
            log(`📊 Metrics exported to ${filename}`, 'info');
        } catch (error) {
            log(`Failed to export metrics: ${error.message}`, 'error');
        }
    }

    /**
     * Load historical metrics
     */
    loadHistoricalMetrics(date) {
        const filename = join(this.metricsDir, `metrics-${date}.json`);
        
        try {
            if (existsSync(filename)) {
                const data = readFileSync(filename, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            log(`Failed to load historical metrics: ${error.message}`, 'error');
        }
        
        return null;
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics.commands.clear();
        this.metrics.events.clear();
        this.metrics.music = {
            tracksPlayed: 0,
            totalDuration: 0,
            playersCreated: 0,
            playersDestroyed: 0,
        };
        this.metrics.api = {
            requests: 0,
            errors: 0,
            avgLatency: 0,
        };
        this.metrics.cache = {
            hits: 0,
            misses: 0,
        };
        
        log('📊 Metrics reset', 'info');
    }

    /**
     * Start periodic metrics export
     */
    startPeriodicExport(intervalHours = 24) {
        setInterval(() => {
            this.exportMetrics();
        }, intervalHours * 60 * 60 * 1000);

        log(`📊 Periodic metrics export started (every ${intervalHours} hours)`, 'info');
    }

    /**
     * Get metrics summary
     */
    getSummary() {
        const metrics = this.getMetrics();
        const topCommands = this.getTopCommands(5);
        
        return {
            totalCommands: Array.from(this.metrics.commands.values())
                .reduce((sum, cmd) => sum + cmd.count, 0),
            totalEvents: Array.from(this.metrics.events.values())
                .reduce((sum, count) => sum + count, 0),
            tracksPlayed: this.metrics.music.tracksPlayed,
            apiRequests: this.metrics.api.requests,
            cacheHitRate: metrics.cache.hitRate,
            topCommands,
        };
    }
}
