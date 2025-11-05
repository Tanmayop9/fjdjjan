/**
 * NEROX V3 - Request Batcher 📦
 * Batch multiple requests for efficiency
 */

export class RequestBatcher {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 100;
        this._queue = [];
        this._timer = null;
    }

    add(request) {
        return new Promise((resolve, reject) => {
            this._queue.push({ request, resolve, reject });

            if (this._queue.length >= this.batchSize) {
                this._flush();
            } else if (!this._timer) {
                this._timer = setTimeout(() => this._flush(), this.flushInterval);
            }
        });
    }

    async _flush() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        if (this._queue.length === 0) return;

        const batch = this._queue.splice(0, this.batchSize);
        
        try {
            const results = await Promise.allSettled(
                batch.map(({ request }) => request())
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    batch[index].resolve(result.value);
                } else {
                    batch[index].reject(result.reason);
                }
            });
        } catch (error) {
            batch.forEach(({ reject }) => reject(error));
        }

        // Process remaining items
        if (this._queue.length > 0) {
            this._flush();
        }
    }

    get pending() {
        return this._queue.length;
    }
}
