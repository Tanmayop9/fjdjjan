/**
 * NEROX V3 - Advanced Lazy Loader 🚀
 * Loads modules on-demand to save memory
 */

export class LazyLoader {
    constructor() {
        this._cache = new WeakMap();
        this._loadedModules = new Map();
        this._accessCount = new Map();
    }

    async load(path, force = false) {
        if (!force && this._loadedModules.has(path)) {
            this._accessCount.set(path, (this._accessCount.get(path) || 0) + 1);
            return this._loadedModules.get(path);
        }

        try {
            const module = await import(path);
            this._loadedModules.set(path, module);
            this._accessCount.set(path, 1);
            return module;
        } catch (error) {
            throw new Error(`Failed to lazy load: ${path} - ${error.message}`);
        }
    }

    unload(path) {
        this._loadedModules.delete(path);
        this._accessCount.delete(path);
    }

    cleanup(threshold = 10) {
        const toRemove = [];
        for (const [path, count] of this._accessCount.entries()) {
            if (count < threshold) {
                toRemove.push(path);
            }
        }
        toRemove.forEach(path => this.unload(path));
        return toRemove.length;
    }

    get stats() {
        return {
            loaded: this._loadedModules.size,
            mostUsed: [...this._accessCount.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
        };
    }
}

export const lazyLoader = new LazyLoader();
