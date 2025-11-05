/**
 * NEROX V3 - Predictive Prefetcher 🔮
 * Machine learning-based prefetching
 */

export class PredictivePrefetcher {
    constructor(cache, options = {}) {
        this.cache = cache;
        this.threshold = options.threshold || 0.6;
        this._patterns = new Map();
        this._sequences = [];
        this.maxPatterns = options.maxPatterns || 100;
    }

    recordAccess(key) {
        this._sequences.push(key);
        if (this._sequences.length > 20) {
            this._analyzePattern();
            this._sequences.shift();
        }
    }

    _analyzePattern() {
        if (this._sequences.length < 3) return;

        for (let i = 0; i < this._sequences.length - 2; i++) {
            const pattern = this._sequences.slice(i, i + 2).join('->');
            const next = this._sequences[i + 2];

            if (!this._patterns.has(pattern)) {
                this._patterns.set(pattern, new Map());
            }

            const outcomes = this._patterns.get(pattern);
            outcomes.set(next, (outcomes.get(next) || 0) + 1);
        }

        // Limit pattern storage
        if (this._patterns.size > this.maxPatterns) {
            const oldest = this._patterns.keys().next().value;
            this._patterns.delete(oldest);
        }
    }

    predict(recentKeys) {
        if (recentKeys.length < 2) return [];

        const pattern = recentKeys.slice(-2).join('->');
        const outcomes = this._patterns.get(pattern);

        if (!outcomes) return [];

        const total = [...outcomes.values()].reduce((a, b) => a + b, 0);
        const predictions = [];

        for (const [key, count] of outcomes.entries()) {
            const probability = count / total;
            if (probability >= this.threshold) {
                predictions.push({ key, probability });
            }
        }

        return predictions.sort((a, b) => b.probability - a.probability);
    }

    async prefetch(recentKeys, loader) {
        const predictions = this.predict(recentKeys);
        
        const prefetchPromises = predictions.map(async ({ key }) => {
            if (!this.cache.has(key)) {
                try {
                    const data = await loader(key);
                    this.cache.set(key, data);
                } catch (error) {
                    // Silent fail for prefetch
                }
            }
        });

        await Promise.allSettled(prefetchPromises);
    }

    get stats() {
        return {
            patterns: this._patterns.size,
            sequences: this._sequences.length,
            topPatterns: [...this._patterns.entries()]
                .map(([pattern, outcomes]) => ({
                    pattern,
                    occurrences: [...outcomes.values()].reduce((a, b) => a + b, 0),
                }))
                .sort((a, b) => b.occurrences - a.occurrences)
                .slice(0, 5),
        };
    }
}
