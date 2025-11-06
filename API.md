# API Documentation

## 🎵 Nerox Bot API Reference

This document provides detailed information about the internal APIs and utilities available in the Nerox music bot.

## 📚 Table of Contents

- [Client API](#client-api)
- [Music Manager](#music-manager)
- [Utility Classes](#utility-classes)
- [Database Operations](#database-operations)
- [Event System](#event-system)

---

## Client API

### ExtendedClient

The main bot client with enhanced features.

#### Properties

```javascript
client.config         // Bot configuration object
client.manager        // Music manager instance
client.commands       // Collection of commands
client.healthCheck    // Health monitoring system
client.optimizer      // Performance optimizer
client.metrics        // Metrics collector
client.validator      // Input validator
client.db            // Database instances
```

#### Methods

##### `client.embed(color)`
Create a custom embed builder.
```javascript
const embed = client.embed('#FF0000')
    .setTitle('Title')
    .setDescription('Description');
```

##### `client.button()`
Create a custom button builder.
```javascript
const button = client.button()
    .setLabel('Click Me')
    .setStyle('Primary');
```

##### `client.getPlayer(ctx)`
Get or create a music player for a guild.
```javascript
const player = client.getPlayer(ctx);
```

##### `client.formatBytes(bytes)`
Format bytes to human-readable string.
```javascript
const size = client.formatBytes(1048576); // "1 MB"
```

##### `client.formatDuration(ms)`
Format milliseconds to duration string.
```javascript
const duration = client.formatDuration(3661000); // "1h 1m 1s"
```

---

## Music Manager

### Manager.init(client)

Initialize the music manager with Kazagumo and Shoukaku.

#### Configuration

```javascript
{
    plugins: [deezer, apple, spotify],
    defaultSearchEngine: 'youtube',
    nodes: [{
        secure: false,
        auth: 'password',
        url: 'localhost:2333',
        name: 'node-name'
    }]
}
```

#### Events

- `playerStart` - Track starts playing
- `playerEnd` - Track ends
- `playerEmpty` - Queue becomes empty
- `playerStuck` - Player gets stuck
- `playerException` - Player encounters error
- `playerDestroy` - Player is destroyed

---

## Utility Classes

### HealthCheck

Monitor bot health and system metrics.

#### Methods

##### `getHealth()`
Get current health status.
```javascript
const health = client.healthCheck.getHealth();
// Returns: { status, uptime, bot, system, metrics, music }
```

##### `performCheck()`
Perform health check and log warnings.
```javascript
client.healthCheck.performCheck();
```

##### `startPeriodicChecks(intervalMinutes)`
Start automatic health monitoring.
```javascript
client.healthCheck.startPeriodicChecks(5);
```

---

### PerformanceOptimizer

Optimize bot performance with caching and resource management.

#### Methods

##### `getOrSet(key, fetcher, ttl)`
Get from cache or fetch and cache.
```javascript
const data = await client.optimizer.getOrSet(
    'user:123',
    async () => await fetchUserData(),
    300000 // 5 minutes TTL
);
```

##### `clearCache()`
Clear all cached data.
```javascript
client.optimizer.clearCache();
```

##### `getCacheStats()`
Get cache performance statistics.
```javascript
const stats = client.optimizer.getCacheStats();
// Returns: { size, hits, misses, hitRate }
```

##### `batchProcess(items, operation, batchSize)`
Process items in batches to reduce load.
```javascript
await client.optimizer.batchProcess(
    userIds,
    async (id) => await updateUser(id),
    10
);
```

---

### MetricsCollector

Collect and analyze bot performance metrics.

#### Methods

##### `recordCommand(name, duration, success)`
Record command execution.
```javascript
client.metrics.recordCommand('play', 150, true);
```

##### `recordEvent(name)`
Record event occurrence.
```javascript
client.metrics.recordEvent('messageCreate');
```

##### `recordMusicActivity(type, data)`
Record music-related activity.
```javascript
client.metrics.recordMusicActivity('trackPlayed', { duration: 240000 });
```

##### `getMetrics()`
Get all collected metrics.
```javascript
const metrics = client.metrics.getMetrics();
```

##### `exportMetrics()`
Export metrics to JSON file.
```javascript
client.metrics.exportMetrics();
```

---

### Validator

Validate user inputs and data.

#### Methods

##### `isValidSnowflake(id)`
Validate Discord snowflake ID.
```javascript
if (Validator.isValidSnowflake(userId)) {
    // Valid ID
}
```

##### `validateMusicQuery(query)`
Validate music search query.
```javascript
const result = Validator.validateMusicQuery(userInput);
if (result.valid) {
    // Process query
}
```

##### `validateVolume(volume)`
Validate volume level (0-200).
```javascript
const result = Validator.validateVolume(volume);
if (result.valid) {
    player.setVolume(result.volume);
}
```

##### `sanitize(input)`
Sanitize user input.
```javascript
const safe = Validator.sanitize(userInput);
```

---

### RetryHandler

Handle failed operations with retry logic.

#### Methods

##### `execute(fn, options)`
Execute function with retry and exponential backoff.
```javascript
const result = await RetryHandler.execute(
    async () => await riskyOperation(),
    {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2
    }
);
```

##### `executeWithCircuitBreaker(fn, options)`
Execute with circuit breaker pattern.
```javascript
const result = await RetryHandler.executeWithCircuitBreaker(
    async () => await externalApiCall(),
    {
        threshold: 5,
        timeout: 60000,
        resetTimeout: 300000
    }
);
```

---

## Database Operations

### Josh Database

Simple key-value database for bot data.

#### Available Databases

```javascript
client.db.noPrefix      // No-prefix guilds
client.db.ticket        // Ticket system
client.db.botmods       // Bot moderators
client.db.botstaff      // Premium users
client.db.blacklist     // Blacklisted users
client.db.ignore        // Ignored channels
client.db.serverstaff   // Server premium
```

#### Methods

##### `get(key)`
Get value by key.
```javascript
const value = await client.db.noPrefix.get(guildId);
```

##### `set(key, value)`
Set value by key.
```javascript
await client.db.noPrefix.set(guildId, true);
```

##### `delete(key)`
Delete entry by key.
```javascript
await client.db.noPrefix.delete(guildId);
```

##### `has(key)`
Check if key exists.
```javascript
if (await client.db.noPrefix.has(guildId)) {
    // Key exists
}
```

---

## Event System

### Event Structure

```javascript
export default class EventName extends Event {
    constructor() {
        super('eventName', 'once' | 'on');
    }
    
    execute = async (client, ...args) => {
        // Event logic
    };
}
```

### Event Types

#### Client Events
- `ready` - Bot is ready
- `messageCreate` - Message received
- `interactionCreate` - Interaction received
- `guildCreate` - Bot joins server
- `guildDelete` - Bot leaves server

#### Music Events
- `trackStart` - Track starts
- `playerDestroy` - Player destroyed
- `playerEmpty` - Queue empty

---

## Command System

### Command Structure

```javascript
export default class CommandName extends Command {
    constructor() {
        super();
        this.name = 'commandname';
        this.aliases = ['alias1', 'alias2'];
        this.description = 'Command description';
        this.usage = '<required> [optional]';
        this.category = 'music';
        this.cooldown = 3; // seconds
        this.permissions = ['SendMessages'];
    }
    
    execute = async (client, ctx, args) => {
        // Command logic
    };
}
```

### Context Object (ctx)

```javascript
ctx.author        // User who ran command
ctx.guild         // Guild where command was run
ctx.channel       // Channel where command was run
ctx.member        // Member object
ctx.reply()       // Reply to command
ctx.defer()       // Defer reply
```

---

## Error Handling

### Try-Catch Pattern

```javascript
try {
    await riskyOperation();
} catch (error) {
    client.log(`Error: ${error.message}`, 'error');
    await ctx.reply({
        embeds: [client.embed().desc(`❌ ${error.message}`)]
    });
}
```

### Retry Pattern

```javascript
const result = await RetryHandler.execute(
    async () => await operation(),
    { maxRetries: 3, initialDelay: 1000 }
);
```

---

## Logging

### Log Levels

```javascript
client.log('Debug message', 'debug');
client.log('Info message', 'info');
client.log('Warning message', 'warn');
client.log('Error message', 'error');
client.log('Success message', 'success');
```

Logs are written to:
- Console (with colors)
- `logs/YYYY-MM-DD.log` files

---

## Best Practices

### 1. Always Validate Input
```javascript
const validation = client.validator.validateMusicQuery(query);
if (!validation.valid) {
    return await ctx.reply({ embeds: [client.embed().desc(validation.reason)] });
}
```

### 2. Use Try-Catch
```javascript
try {
    await operation();
} catch (error) {
    client.log(`Error: ${error.message}`, 'error');
}
```

### 3. Cache Expensive Operations
```javascript
const data = await client.optimizer.getOrSet('key', fetcher, 300000);
```

### 4. Record Metrics
```javascript
client.metrics.recordCommand('commandName', duration, success);
```

### 5. Check Health
```javascript
const health = client.healthCheck.getHealth();
if (health.bot.ws.ping > 200) {
    // High latency warning
}
```

---

## Support

For more information:
- GitHub: https://github.com/yourusername/nerox
- Discord: https://discord.gg/p6nXDJMeyc
- Email: support@codes-for.fun

---

Made with ❤️ by the Nerox team
