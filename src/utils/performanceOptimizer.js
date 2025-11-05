/**
 * Performance Optimizer
 * Implements caching, optimization strategies, and performance monitoring
 */
import { log } from '../logger.js';

export class PerformanceOptimizer {
    constructor(client) {
        this.client = client;
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
        };
    }

    /**
     * Get or set cache with TTL (Time To Live)
     * @param {string} key - Cache key
     * @param {Function} fetcher - Function to fetch data if not in cache
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     */
    async getOrSet(key, fetcher, ttl = 300000) {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() < cached.expiry) {
            this.cacheStats.hits++;
            return cached.data;
        }

        this.cacheStats.misses++;
        const data = await fetcher();
        
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl,
        });

        return data;
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key) {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        log(`🧹 Cleared ${size} cache entries`, 'info');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
        
        return {
            size: this.cache.size,
            hits: this.cacheStats.hits,
            misses: this.cacheStats.misses,
            hitRate: `${hitRate}%`,
        };
    }

    /**
     * Clean up expired cache entries
     */
    cleanupExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.cache.entries()) {
            if (now >= value.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            log(`🧹 Cleaned ${cleaned} expired cache entries`, 'debug');
        }

        return cleaned;
    }

    /**
     * Start periodic cache cleanup
     */
    startCacheCleanup(intervalMinutes = 10) {
        setInterval(() => {
            this.cleanupExpired();
        }, intervalMinutes * 60 * 1000);

        log(`✅ Cache cleanup started (every ${intervalMinutes} minutes)`, 'info');
    }

    /**
     * Optimize guild cache - remove non-essential cached data
     */
    optimizeGuildCache() {
        let count = 0;
        
        for (const guild of this.client.guilds.cache.values()) {
            // Clear member cache for large guilds
            if (guild.members.cache.size > 1000) {
                guild.members.cache.clear();
                count++;
            }
        }

        if (count > 0) {
            log(`🔧 Optimized ${count} guild caches`, 'debug');
        }
    }

    /**
     * Memory optimization - force garbage collection if available
     */
    optimizeMemory() {
        if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freed = ((before - after) / 1024 / 1024).toFixed(2);
            
            log(`🧹 Garbage collection freed ${freed} MB`, 'debug');
        }
    }

    /**
     * Batch operations to reduce API calls
     * @param {Array} items - Items to process
     * @param {Function} operation - Operation to perform on each item
     * @param {number} batchSize - Number of items per batch
     */
    async batchProcess(items, operation, batchSize = 10) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(
                batch.map(item => operation(item))
            );
            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Debounce function to limit execution frequency
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     */
    debounce(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between executions in milliseconds
     */
    throttle(func, limit) {
        let inThrottle;
        
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Start all optimization routines
     */
    startOptimizations() {
        this.startCacheCleanup(10);
        
        // Periodic memory optimization every 30 minutes
        setInterval(() => {
            this.optimizeMemory();
            this.optimizeGuildCache();
        }, 30 * 60 * 1000);

        log('✅ Performance optimizations started', 'success');
    }
}
