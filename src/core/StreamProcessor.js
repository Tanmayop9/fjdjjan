/**
 * NEROX V3 - Stream Processor 🌊
 * Memory-efficient stream-based processing
 */

import { Transform } from 'stream';

export class StreamProcessor {
    static createChunker(chunkSize = 1024) {
        const chunks = [];
        let currentSize = 0;

        return new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                chunks.push(chunk);
                currentSize += chunk.length;

                if (currentSize >= chunkSize) {
                    this.push(Buffer.concat(chunks));
                    chunks.length = 0;
                    currentSize = 0;
                }
                callback();
            },
            flush(callback) {
                if (chunks.length > 0) {
                    this.push(Buffer.concat(chunks));
                }
                callback();
            },
        });
    }

    static createBatcher(batchSize = 10) {
        const batch = [];

        return new Transform({
            objectMode: true,
            transform(item, encoding, callback) {
                batch.push(item);
                if (batch.length >= batchSize) {
                    this.push([...batch]);
                    batch.length = 0;
                }
                callback();
            },
            flush(callback) {
                if (batch.length > 0) {
                    this.push([...batch]);
                }
                callback();
            },
        });
    }

    static async processInBatches(items, batchSize, processor) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // Allow GC between batches
            if (global.gc && i % (batchSize * 10) === 0) {
                global.gc();
            }
        }
        return results;
    }
}
