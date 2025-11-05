/**
 * NEROX V3 - Memory Monitor 📊
 * Advanced memory tracking and auto-optimization
 */

export class MemoryMonitor {
    constructor(client) {
        this.client = client;
        this._snapshots = [];
        this._maxSnapshots = 10;
        this._thresholds = {
            warning: 0.7,
            critical: 0.85,
        };
    }

    start(interval = 30000) {
        this._interval = setInterval(() => this.check(), interval);
    }

    stop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    check() {
        const usage = process.memoryUsage();
        const snapshot = {
            timestamp: Date.now(),
            heapUsed: usage.heapUsed,
            heapTotal: usage.heapTotal,
            external: usage.external,
            rss: usage.rss,
            ratio: usage.heapUsed / usage.heapTotal,
        };

        this._snapshots.push(snapshot);
        if (this._snapshots.length > this._maxSnapshots) {
            this._snapshots.shift();
        }

        if (snapshot.ratio > this._thresholds.critical) {
            this._handleCritical(snapshot);
        } else if (snapshot.ratio > this._thresholds.warning) {
            this._handleWarning(snapshot);
        }

        return snapshot;
    }

    _handleWarning(snapshot) {
        this.client?.log(`⚠️ Memory warning: ${(snapshot.ratio * 100).toFixed(1)}%`, 'warn');
        
        // Trigger cache cleanup
        if (this.client?.cache) {
            this.client.cache.clear();
        }
    }

    _handleCritical(snapshot) {
        this.client?.log(`🚨 Critical memory: ${(snapshot.ratio * 100).toFixed(1)}%`, 'error');
        
        // Aggressive cleanup
        if (global.gc) {
            global.gc();
        }
        
        // Clear all caches
        if (this.client?.cache) {
            this.client.cache.clear();
        }
    }

    get stats() {
        const current = this.check();
        const trend = this._calculateTrend();
        
        return {
            current: {
                heapUsed: this._formatBytes(current.heapUsed),
                heapTotal: this._formatBytes(current.heapTotal),
                rss: this._formatBytes(current.rss),
                ratio: `${(current.ratio * 100).toFixed(1)}%`,
            },
            trend,
            snapshots: this._snapshots.length,
        };
    }

    _calculateTrend() {
        if (this._snapshots.length < 2) return 'stable';
        
        const recent = this._snapshots.slice(-3);
        const ratios = recent.map(s => s.ratio);
        const avg = ratios.reduce((a, b) => a + b) / ratios.length;
        const last = ratios[ratios.length - 1];
        
        if (last > avg * 1.1) return 'increasing';
        if (last < avg * 0.9) return 'decreasing';
        return 'stable';
    }

    _formatBytes(bytes) {
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(2)} MB`;
    }
}
