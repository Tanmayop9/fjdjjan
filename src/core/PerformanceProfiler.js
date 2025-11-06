/**
 * NEROX V3 - Performance Profiler 📈
 * Built-in performance tracking
 */

export class PerformanceProfiler {
    constructor() {
        this._timings = new Map();
        this._counters = new Map();
    }

    startTimer(label) {
        const start = process.hrtime.bigint();
        return {
            end: () => {
                const end = process.hrtime.bigint();
                const duration = Number(end - start) / 1_000_000; // Convert to ms
                
                if (!this._timings.has(label)) {
                    this._timings.set(label, []);
                }
                
                const timings = this._timings.get(label);
                timings.push(duration);
                
                // Keep only last 100 measurements
                if (timings.length > 100) {
                    timings.shift();
                }
                
                return duration;
            },
        };
    }

    count(label, increment = 1) {
        this._counters.set(label, (this._counters.get(label) || 0) + increment);
    }

    getTimingStats(label) {
        const timings = this._timings.get(label);
        if (!timings || timings.length === 0) return null;

        const sorted = [...timings].sort((a, b) => a - b);
        const sum = sorted.reduce((a, b) => a + b, 0);
        const avg = sum / sorted.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        return {
            count: timings.length,
            avg: avg.toFixed(2),
            median: median.toFixed(2),
            p95: p95.toFixed(2),
            p99: p99.toFixed(2),
            min: Math.min(...sorted).toFixed(2),
            max: Math.max(...sorted).toFixed(2),
        };
    }

    getCounter(label) {
        return this._counters.get(label) || 0;
    }

    report() {
        const report = {
            timings: {},
            counters: Object.fromEntries(this._counters),
        };

        for (const label of this._timings.keys()) {
            report.timings[label] = this.getTimingStats(label);
        }

        return report;
    }

    reset() {
        this._timings.clear();
        this._counters.clear();
    }
}

export const globalProfiler = new PerformanceProfiler();
