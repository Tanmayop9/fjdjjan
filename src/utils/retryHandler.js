/**
 * Advanced Retry Mechanism
 * Implements exponential backoff and retry logic for failed operations
 */
import { log } from '../logger.js';

export class RetryHandler {
    /**
     * Execute a function with retry logic
     * @param {Function} fn - Function to execute
     * @param {Object} options - Retry options
     * @param {number} options.maxRetries - Maximum number of retries (default: 3)
     * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
     * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
     * @param {number} options.backoffMultiplier - Multiplier for exponential backoff (default: 2)
     * @param {Function} options.onRetry - Callback function on retry
     * @returns {Promise<any>} Result of the function
     */
    static async execute(fn, options = {}) {
        const {
            maxRetries = 3,
            initialDelay = 1000,
            maxDelay = 30000,
            backoffMultiplier = 2,
            onRetry = null,
        } = options;

        let lastError;
        let delay = initialDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    // Calculate next delay with exponential backoff
                    const nextDelay = Math.min(delay * backoffMultiplier, maxDelay);
                    
                    log(
                        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`,
                        'warn'
                    );

                    if (onRetry) {
                        await onRetry(error, attempt + 1, delay);
                    }

                    await this.sleep(delay);
                    delay = nextDelay;
                } else {
                    log(
                        `All ${maxRetries} retry attempts failed: ${error.message}`,
                        'error'
                    );
                }
            }
        }

        throw lastError;
    }

    /**
     * Execute with circuit breaker pattern
     * @param {Function} fn - Function to execute
     * @param {Object} options - Circuit breaker options
     */
    static async executeWithCircuitBreaker(fn, options = {}) {
        const {
            threshold = 5,
            timeout = 60000,
            resetTimeout = 300000,
        } = options;

        const circuitKey = fn.name || 'anonymous';

        if (!this.circuits) {
            this.circuits = new Map();
        }

        let circuit = this.circuits.get(circuitKey);

        if (!circuit) {
            circuit = {
                failures: 0,
                lastFailure: null,
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            };
            this.circuits.set(circuitKey, circuit);
        }

        // Check if circuit is open
        if (circuit.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - circuit.lastFailure;
            
            if (timeSinceLastFailure < resetTimeout) {
                throw new Error(`Circuit breaker is OPEN for ${circuitKey}`);
            } else {
                circuit.state = 'HALF_OPEN';
                log(`Circuit breaker ${circuitKey} entering HALF_OPEN state`, 'info');
            }
        }

        try {
            const result = await Promise.race([
                fn(),
                this.timeout(timeout),
            ]);

            // Success - reset circuit
            if (circuit.state === 'HALF_OPEN') {
                circuit.state = 'CLOSED';
                log(`Circuit breaker ${circuitKey} closed`, 'success');
            }
            circuit.failures = 0;

            return result;
        } catch (error) {
            circuit.failures++;
            circuit.lastFailure = Date.now();

            if (circuit.failures >= threshold) {
                circuit.state = 'OPEN';
                log(`Circuit breaker ${circuitKey} opened after ${circuit.failures} failures`, 'error');
            }

            throw error;
        }
    }

    /**
     * Execute with timeout
     * @param {number} ms - Timeout in milliseconds
     */
    static timeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
        });
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry with jitter to prevent thundering herd
     * @param {Function} fn - Function to execute
     * @param {Object} options - Retry options
     */
    static async executeWithJitter(fn, options = {}) {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 30000,
        } = options;

        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    // Add random jitter (0-100% of base delay)
                    const jitter = Math.random() * baseDelay;
                    const delay = Math.min(
                        baseDelay * Math.pow(2, attempt) + jitter,
                        maxDelay
                    );

                    log(
                        `Retry with jitter ${attempt + 1}/${maxRetries} after ${delay.toFixed(0)}ms`,
                        'warn'
                    );

                    await this.sleep(delay);
                }
            }
        }

        throw lastError;
    }

    /**
     * Get circuit breaker status
     */
    static getCircuitStatus(circuitKey) {
        if (!this.circuits) return null;
        return this.circuits.get(circuitKey);
    }

    /**
     * Reset circuit breaker
     */
    static resetCircuit(circuitKey) {
        if (!this.circuits) return;
        
        const circuit = this.circuits.get(circuitKey);
        if (circuit) {
            circuit.failures = 0;
            circuit.state = 'CLOSED';
            circuit.lastFailure = null;
            log(`Circuit breaker ${circuitKey} manually reset`, 'info');
        }
    }
}
