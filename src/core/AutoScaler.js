/**
 * NEROX V3 - Auto Scaler ⚙️
 * Dynamic scaling based on load
 */

export class AutoScaler {
    constructor(options = {}) {
        this.minInstances = options.minInstances || 1;
        this.maxInstances = options.maxInstances || 4;
        this.scaleUpThreshold = options.scaleUpThreshold || 0.8;
        this.scaleDownThreshold = options.scaleDownThreshold || 0.3;
        this.cooldown = options.cooldown || 60000;
        
        this._lastScale = 0;
        this._metrics = [];
    }

    shouldScale(currentLoad, currentInstances) {
        if (Date.now() - this._lastScale < this.cooldown) {
            return { action: 'wait', reason: 'cooldown' };
        }

        this._metrics.push({ load: currentLoad, timestamp: Date.now() });
        if (this._metrics.length > 10) this._metrics.shift();

        const avgLoad = this._metrics.reduce((a, b) => a + b.load, 0) / this._metrics.length;

        if (avgLoad > this.scaleUpThreshold && currentInstances < this.maxInstances) {
            this._lastScale = Date.now();
            return { action: 'up', instances: currentInstances + 1 };
        }

        if (avgLoad < this.scaleDownThreshold && currentInstances > this.minInstances) {
            this._lastScale = Date.now();
            return { action: 'down', instances: currentInstances - 1 };
        }

        return { action: 'none', currentLoad: avgLoad };
    }

    get stats() {
        return {
            metrics: this._metrics.length,
            lastScale: new Date(this._lastScale),
            avgLoad: this._metrics.length > 0
                ? (this._metrics.reduce((a, b) => a + b.load, 0) / this._metrics.length).toFixed(2)
                : 0,
        };
    }
}
