/**
 * @nerox v2.0.0 - Enhanced Anti-Crash System
 * @author Tanmay
 * @description Advanced error handling with recovery mechanisms
 */
import { log } from '../logger.js';
import process from 'node:process';

// Track error frequencies for smarter handling
const errorFrequency = new Map();
const ERROR_THRESHOLD = 5; // Max errors of same type within window
const ERROR_WINDOW = 60000; // 1 minute window

/**
 * Enhanced crash handler with error tracking and filtering
 * @param {string} type - Type of error (UncaughtException, UnhandledRejection, etc.)
 * @param {...any} args - Error arguments
 */
const handleCrash = (type, ...args) => {
    const err = args[0];
    const errString = `${err}`.toLowerCase();
    
    // Filter out known non-critical errors
    const ignoredErrors = [
        'unknown message',
        'already destroyed',
        'missing access',
        'unknown interaction',
        'interaction has already been acknowledged'
    ];
    
    if (ignoredErrors.some(ignored => errString.includes(ignored))) {
        return;
    }
    
    // Track error frequency
    const errorKey = `${type}-${errString.substring(0, 50)}`;
    const now = Date.now();
    
    if (!errorFrequency.has(errorKey)) {
        errorFrequency.set(errorKey, []);
    }
    
    const timestamps = errorFrequency.get(errorKey);
    timestamps.push(now);
    
    // Clean old timestamps outside window
    const recentTimestamps = timestamps.filter(t => now - t < ERROR_WINDOW);
    errorFrequency.set(errorKey, recentTimestamps);
    
    // Check if error is happening too frequently
    if (recentTimestamps.length >= ERROR_THRESHOLD) {
        log(`⚠️ Critical: ${type} occurring too frequently! Consider investigating.`, 'error');
    }
    
    // Log the error with full details
    log(`🛡️ [Anti-Crash] ${type}:`, 'error');
    
    if (err instanceof Error) {
        log(`   Message: ${err.message}`, 'error');
        if (err.stack) {
            log(`   Stack: ${err.stack.split('\n').slice(0, 3).join('\n')}`, 'error');
        }
    } else {
        console.error(...args);
    }
};

/**
 * Handle process warnings
 */
const handleWarning = (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        log(`⚠️ Warning: ${warning.name} - ${warning.message}`, 'warn');
    }
};

/**
 * Initialize enhanced anti-crash system
 */
export const loadAntiCrash = () => {
    log('🛡️ Enhanced Anti-Crash System is now ACTIVE', 'success');
    
    process.on('uncaughtException', (...args) => handleCrash('UncaughtException', ...args));
    process.on('unhandledRejection', (...args) => handleCrash('UnhandledRejection', ...args));
    process.on('warning', handleWarning);
    
    // Prevent process from crashing on uncaught exceptions
    process.setMaxListeners(15);
    
    // Log process info
    log(`   Node Version: ${process.version}`, 'debug');
    log(`   Platform: ${process.platform} (${process.arch})`, 'debug');
};
