/**
 * NEROX V3 - Advanced LRU Cache with TTL 🔥
 * Memory-efficient caching with automatic eviction
 */

export class AdvancedCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 100;
        this.ttl = options.ttl || 300000; // 5 minutes default
        this._cache = new Map();
        this._timers = new Map();
        this._hits = 0;
        this._misses = 0;
    }

    set(key, value, ttl = this.ttl) {
        if (this._cache.size >= this.maxSize && !this._cache.has(key)) {
            const firstKey = this._cache.keys().next().value;
            this.delete(firstKey);
        }

        this._cache.set(key, value);
        this._resetTimer(key, ttl);
        return this;
    }

    get(key) {
        if (!this._cache.has(key)) {
            this._misses++;
            return undefined;
        }

        this._hits++;
        const value = this._cache.get(key);
        
        // LRU: Move to end
        this._cache.delete(key);
        this._cache.set(key, value);
        
        return value;
    }

    has(key) {
        return this._cache.has(key);
    }

    delete(key) {
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
            this._timers.delete(key);
        }
        return this._cache.delete(key);
    }

    clear() {
        for (const timer of this._timers.values()) {
            clearTimeout(timer);
        }
        this._timers.clear();
        this._cache.clear();
        this._hits = 0;
        this._misses = 0;
    }

    _resetTimer(key, ttl) {
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
        }

        const timer = setTimeout(() => {
            this.delete(key);
        }, ttl);

        this._timers.set(key, timer);
    }

    get stats() {
        const total = this._hits + this._misses;
        return {
            size: this._cache.size,
            hits: this._hits,
            misses: this._misses,
            hitRate: total > 0 ? (this._hits / total * 100).toFixed(2) + '%' : '0%',
            memory: this._estimateMemory(),
        };
    }

    _estimateMemory() {
        let bytes = 0;
        for (const [key, value] of this._cache.entries()) {
            bytes += JSON.stringify({ key, value }).length;
        }
        return `${(bytes / 1024).toFixed(2)} KB`;
    }
}
