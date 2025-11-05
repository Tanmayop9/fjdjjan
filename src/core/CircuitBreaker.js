/**
 * NEROX V3 - Circuit Breaker Pattern ⚡
 * Prevents cascade failures with smart retry
 */

export class CircuitBreaker {
    constructor(options = {}) {
        this.threshold = options.threshold || 5;
        this.timeout = options.timeout || 60000;
        this.resetTime = options.resetTime || 30000;
        
        this._failures = 0;
        this._state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this._nextAttempt = Date.now();
    }

    async execute(fn) {
        if (this._state === 'OPEN') {
            if (Date.now() < this._nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this._state = 'HALF_OPEN';
        }

        try {
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.timeout)
                ),
            ]);
            
            this._onSuccess();
            return result;
        } catch (error) {
            this._onFailure();
            throw error;
        }
    }

    _onSuccess() {
        this._failures = 0;
        this._state = 'CLOSED';
    }

    _onFailure() {
        this._failures++;
        if (this._failures >= this.threshold) {
            this._state = 'OPEN';
            this._nextAttempt = Date.now() + this.resetTime;
        }
    }

    get state() {
        return {
            status: this._state,
            failures: this._failures,
            nextAttempt: new Date(this._nextAttempt),
        };
    }

    reset() {
        this._failures = 0;
        this._state = 'CLOSED';
        this._nextAttempt = Date.now();
    }
}
