/**
 * Input Validation Utilities
 * Comprehensive validation for user inputs and data
 */

export class Validator {
    /**
     * Validate Discord snowflake ID
     * @param {string} id - ID to validate
     * @returns {boolean}
     */
    static isValidSnowflake(id) {
        return /^\d{17,19}$/.test(id);
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean}
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate webhook URL
     * @param {string} url - Webhook URL to validate
     * @returns {boolean}
     */
    static isValidWebhookUrl(url) {
        return /^https:\/\/discord\.com\/api\/webhooks\/\d{17,19}\/.+$/.test(url);
    }

    /**
     * Validate music URL or search query
     * @param {string} query - Query to validate
     * @returns {Object} Validation result
     */
    static validateMusicQuery(query) {
        if (!query || typeof query !== 'string') {
            return { valid: false, reason: 'Query must be a non-empty string' };
        }

        const trimmed = query.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, reason: 'Query cannot be empty' };
        }

        if (trimmed.length > 1000) {
            return { valid: false, reason: 'Query is too long (max 1000 characters)' };
        }

        // Check for supported platforms
        const supportedPlatforms = [
            /youtube\.com/,
            /youtu\.be/,
            /spotify\.com/,
            /soundcloud\.com/,
            /apple\.music/,
            /deezer\.com/,
        ];

        const isUrl = this.isValidUrl(trimmed);
        
        if (isUrl) {
            const supported = supportedPlatforms.some(pattern => pattern.test(trimmed));
            if (!supported) {
                return { valid: false, reason: 'Unsupported music platform' };
            }
        }

        return { valid: true, query: trimmed, isUrl };
    }

    /**
     * Validate volume level
     * @param {number} volume - Volume level to validate
     * @returns {Object} Validation result
     */
    static validateVolume(volume) {
        const num = parseInt(volume);
        
        if (isNaN(num)) {
            return { valid: false, reason: 'Volume must be a number' };
        }

        if (num < 0 || num > 200) {
            return { valid: false, reason: 'Volume must be between 0 and 200' };
        }

        return { valid: true, volume: num };
    }

    /**
     * Validate time string (e.g., "1h30m", "45s")
     * @param {string} timeStr - Time string to validate
     * @returns {Object} Validation result with milliseconds
     */
    static validateTimeString(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            return { valid: false, reason: 'Time must be a string' };
        }

        const pattern = /^(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
        const match = timeStr.match(pattern);

        if (!match) {
            return { valid: false, reason: 'Invalid time format (use: 1d2h30m45s)' };
        }

        const [, days = 0, hours = 0, minutes = 0, seconds = 0] = match;
        const ms = (
            parseInt(days) * 86400000 +
            parseInt(hours) * 3600000 +
            parseInt(minutes) * 60000 +
            parseInt(seconds) * 1000
        );

        if (ms === 0) {
            return { valid: false, reason: 'Time cannot be zero' };
        }

        return { valid: true, milliseconds: ms };
    }

    /**
     * Validate filter name
     * @param {string} filterName - Filter name to validate
     * @param {Array} availableFilters - Array of available filter names
     * @returns {Object} Validation result
     */
    static validateFilter(filterName, availableFilters = []) {
        if (!filterName || typeof filterName !== 'string') {
            return { valid: false, reason: 'Filter name must be provided' };
        }

        const normalized = filterName.toLowerCase().trim();

        if (availableFilters.length > 0 && !availableFilters.includes(normalized)) {
            return {
                valid: false,
                reason: `Unknown filter. Available: ${availableFilters.join(', ')}`,
            };
        }

        return { valid: true, filter: normalized };
    }

    /**
     * Validate prefix
     * @param {string} prefix - Prefix to validate
     * @returns {Object} Validation result
     */
    static validatePrefix(prefix) {
        if (!prefix || typeof prefix !== 'string') {
            return { valid: false, reason: 'Prefix must be a non-empty string' };
        }

        if (prefix.length > 10) {
            return { valid: false, reason: 'Prefix too long (max 10 characters)' };
        }

        if (prefix.includes(' ')) {
            return { valid: false, reason: 'Prefix cannot contain spaces' };
        }

        // Check for problematic characters
        const problematicChars = ['@', '#', ':', '`'];
        if (problematicChars.some(char => prefix.includes(char))) {
            return { valid: false, reason: 'Prefix contains invalid characters' };
        }

        return { valid: true, prefix };
    }

    /**
     * Sanitize user input
     * @param {string} input - Input to sanitize
     * @returns {string} Sanitized input
     */
    static sanitize(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML/markdown injection
            .slice(0, 2000); // Limit length
    }

    /**
     * Validate permissions
     * @param {Object} member - Discord member object
     * @param {Array} requiredPerms - Array of required permission names
     * @returns {Object} Validation result
     */
    static validatePermissions(member, requiredPerms = []) {
        if (!member || !member.permissions) {
            return { valid: false, reason: 'Invalid member object' };
        }

        const missing = requiredPerms.filter(perm => !member.permissions.has(perm));

        if (missing.length > 0) {
            return {
                valid: false,
                reason: `Missing permissions: ${missing.join(', ')}`,
                missing,
            };
        }

        return { valid: true };
    }

    /**
     * Validate rate limit compliance
     * @param {Map} rateLimitMap - Map tracking rate limits
     * @param {string} key - Rate limit key (e.g., user ID)
     * @param {Object} options - Rate limit options
     * @returns {Object} Validation result
     */
    static validateRateLimit(rateLimitMap, key, options = {}) {
        const { maxRequests = 5, windowMs = 60000 } = options;
        const now = Date.now();

        if (!rateLimitMap.has(key)) {
            rateLimitMap.set(key, [now]);
            return { valid: true, remaining: maxRequests - 1 };
        }

        const timestamps = rateLimitMap.get(key);
        const recent = timestamps.filter(ts => now - ts < windowMs);

        if (recent.length >= maxRequests) {
            const oldestTimestamp = Math.min(...recent);
            const resetTime = oldestTimestamp + windowMs;
            const retryAfter = Math.ceil((resetTime - now) / 1000);

            return {
                valid: false,
                reason: 'Rate limit exceeded',
                retryAfter,
            };
        }

        recent.push(now);
        rateLimitMap.set(key, recent);

        return { valid: true, remaining: maxRequests - recent.length };
    }

    /**
     * Validate command arguments
     * @param {Array} args - Arguments to validate
     * @param {Array} schema - Validation schema
     * @returns {Object} Validation result
     */
    static validateCommandArgs(args, schema = []) {
        const errors = [];

        for (let i = 0; i < schema.length; i++) {
            const rule = schema[i];
            const value = args[i];

            if (rule.required && !value) {
                errors.push(`Argument ${i + 1} (${rule.name}) is required`);
                continue;
            }

            if (value && rule.type) {
                const typeValid = this.validateType(value, rule.type);
                if (!typeValid) {
                    errors.push(`Argument ${i + 1} (${rule.name}) must be of type ${rule.type}`);
                }
            }

            if (value && rule.validator) {
                const customValid = rule.validator(value);
                if (!customValid) {
                    errors.push(`Argument ${i + 1} (${rule.name}) failed custom validation`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }

    /**
     * Validate type
     * @private
     */
    static validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return !isNaN(Number(value));
            case 'boolean':
                return value === 'true' || value === 'false';
            case 'url':
                return this.isValidUrl(value);
            case 'snowflake':
                return this.isValidSnowflake(value);
            default:
                return true;
        }
    }
}
