import chalk from 'chalk';
import moment from 'moment-timezone';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logStyles = {
    info: chalk.hex('#66ccff'),
    warn: chalk.hex('#ffaa00'),
    debug: chalk.hex('#555555'),
    error: chalk.hex('#ff2200'),
    success: chalk.hex('#77ee55'),
};

// Ensure logs directory exists
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
}

/**
 * Enhanced logging function with file output and better formatting
 * @param {string} content - The message to log
 * @param {string} logLevel - The log level (info, warn, debug, error, success)
 */
export const log = (content, logLevel = 'debug') => {
    const timestamp = moment().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss Z');
    const coloredContent = logStyles[logLevel](content);
    const consoleMethod = logLevel === 'success' ? 'log' : logLevel;
    
    // Console output
    console[consoleMethod](`${timestamp} ${coloredContent}`);
    
    // File output (without colors)
    try {
        const logFile = join(logsDir, `${moment().format('YYYY-MM-DD')}.log`);
        const logEntry = `[${timestamp}] [${logLevel.toUpperCase()}] ${content}\n`;
        writeFileSync(logFile, logEntry, { flag: 'a' });
    } catch (error) {
        // Silently fail if unable to write to file
    }
};
