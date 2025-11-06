/**
 * NEROX V3 - Object Pool Pattern 💎
 * Reuses objects to reduce GC pressure
 */

export class ObjectPool {
    constructor(factory, reset, initialSize = 10, maxSize = 100) {
        this._factory = factory;
        this._reset = reset;
        this._available = [];
        this._inUse = new Set();
        this._maxSize = maxSize;
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this._available.push(this._factory());
        }
    }

    acquire() {
        let obj;
        
        if (this._available.length > 0) {
            obj = this._available.pop();
        } else if (this._inUse.size < this._maxSize) {
            obj = this._factory();
        } else {
            throw new Error('Object pool exhausted');
        }
        
        this._inUse.add(obj);
        return obj;
    }

    release(obj) {
        if (!this._inUse.has(obj)) {
            return false;
        }
        
        this._inUse.delete(obj);
        this._reset(obj);
        this._available.push(obj);
        return true;
    }

    drain() {
        this._available = [];
        this._inUse.clear();
    }

    get stats() {
        return {
            available: this._available.length,
            inUse: this._inUse.size,
            total: this._available.length + this._inUse.size,
            maxSize: this._maxSize,
        };
    }
}

// Embed pool factory
export const createEmbedPool = () => new ObjectPool(
    () => ({ data: {} }),
    (obj) => { obj.data = {}; },
    20,
    100
);
