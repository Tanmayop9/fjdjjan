# 🎵 Nerox - Ultra-Advanced Discord Music Bot

> A next-generation Discord music bot with cutting-edge features, enterprise-grade error handling, and exceptional performance.

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-Custom-orange.svg)](LICENSE)

## ✨ Features

### 🎼 Music Capabilities
- **Multi-Platform Support**: YouTube, Spotify, Apple Music, Deezer, SoundCloud
- **Advanced Queue Management**: Shuffle, loop, skip, remove tracks
- **Audio Filters**: Bassboost, nightcore, vaporwave, 8D audio, and more
- **Autoplay**: Intelligent track recommendations
- **24/7 Mode**: Continuous playback support
- **DJ Mode**: Role-based music control
- **Favorites System**: Save and quickly play your favorite tracks
- **Playlist Management**: Import and manage playlists

### 🚀 Performance & Reliability
- **Cluster Sharding**: Horizontal scaling with discord-hybrid-sharding
- **Advanced Caching**: Intelligent cache management with TTL
- **Memory Optimization**: Automatic garbage collection and cache cleanup
- **Health Monitoring**: Real-time system and bot health metrics
- **Graceful Shutdown**: Proper cleanup on process termination
- **Error Recovery**: Advanced anti-crash system with error tracking
- **Rate Limiting**: Built-in protection against API abuse

### 🔐 Security
- **Environment-Based Config**: All secrets loaded from .env
- **Permission System**: Role and user-based access control
- **Blacklist System**: Block malicious users/servers
- **Input Validation**: Comprehensive validation on all inputs
- **Webhook Protection**: Secure webhook URLs

### 📊 Advanced Features
- **Premium System**: Bot and server premium tiers
- **Statistics Tracking**: Commands used, songs played, streaks
- **Ticket System**: Built-in support ticket management
- **Giveaway System**: Host and manage giveaways
- **Custom Prefix**: Per-server prefix configuration
- **Multi-Language**: Localization support ready
- **Comprehensive Logging**: File and console logging with rotation

## 📋 Prerequisites

- **Node.js**: v20.x or higher
- **Lavalink Server**: For music playback
- **Discord Bot Token**: From [Discord Developer Portal](https://discord.com/developers/applications)
- **MongoDB** (Optional): For persistent data storage

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/nerox.git
cd nerox
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:

```env
TOKEN=your_discord_bot_token
OWNERS=owner_user_id_1,owner_user_id_2
ADMINS=admin_user_id_1
PREFIX=&

# Lavalink Configuration
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Spotify (Optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Webhooks (Optional)
WEBHOOK_LOGS=your_logs_webhook_url
WEBHOOK_SERVER_ADD=your_server_add_webhook_url
WEBHOOK_SERVER_REMOVE=your_server_remove_webhook_url
WEBHOOK_PLAYER_LOGS=your_player_logs_webhook_url
```

### 4. Set Up Lavalink

Download and run [Lavalink](https://github.com/lavalink-devs/Lavalink):

```bash
# Download Lavalink.jar
wget https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar

# Run Lavalink
java -jar Lavalink.jar
```

### 5. Start the Bot

```bash
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## 📁 Project Structure

```
nerox/
├── src/
│   ├── assets/          # Static assets (emojis, images)
│   ├── classes/         # Core classes
│   │   ├── client.js    # Extended Discord client
│   │   ├── config.js    # Configuration loader
│   │   ├── manager.js   # Music manager
│   │   ├── embed.js     # Custom embed builder
│   │   └── button.js    # Custom button builder
│   ├── commands/        # Command modules
│   │   ├── music/       # Music commands
│   │   ├── information/ # Info commands
│   │   ├── utility/     # Utility commands
│   │   └── admin/       # Admin commands
│   ├── events/          # Event handlers
│   │   ├── client/      # Client events
│   │   ├── context/     # Context-specific events
│   │   └── playerRelated/ # Music player events
│   ├── functions/       # Utility functions
│   ├── loaders/         # Module loaders
│   ├── utils/           # Utility modules
│   │   ├── anticrash.js          # Error handling
│   │   ├── healthCheck.js        # Health monitoring
│   │   ├── performanceOptimizer.js # Performance tools
│   │   ├── ratelimiter.js        # Rate limiting
│   │   └── paginator.js          # Pagination system
│   ├── interfaces/      # TypeScript interfaces
│   ├── index.js         # Entry point (cluster manager)
│   ├── nerox.js         # Bot initialization
│   └── logger.js        # Logging system
├── logs/                # Log files (auto-generated)
├── database-storage/    # Local database storage
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── README.md           # This file
```

## 🎮 Usage

### Basic Commands

```
&help           - Show all commands
&play <song>    - Play a song
&skip           - Skip current track
&queue          - Show music queue
&volume <1-100> - Set volume
&loop           - Toggle loop mode
&shuffle        - Shuffle queue
&lyrics         - Get song lyrics
&filter <name>  - Apply audio filter
```

### Admin Commands

```
&prefix <new>   - Change server prefix
&247            - Toggle 24/7 mode
&dj <role>      - Set DJ role
&ignore <channel> - Ignore channel
```

## 🔧 Configuration

### Cluster Settings

Edit `src/index.js` to configure clustering:

```javascript
totalClusters: availableParallelism(), // Auto-detect CPU cores
totalShards: 'auto', // Auto-calculate shards
```

### Music Settings

Edit `src/classes/manager.js` for music configuration:

```javascript
defaultSearchEngine: 'youtube', // or 'spotify', 'soundcloud'
```

## 🚀 Performance Optimization

### Memory Management

The bot includes automatic memory optimization:
- Periodic garbage collection
- Cache cleanup every 10 minutes
- Guild cache optimization for large servers

### Caching

Intelligent caching with TTL:
```javascript
// Default TTL: 5 minutes
const result = await optimizer.getOrSet('key', fetcherFunc, 300000);
```

## 📊 Monitoring

### Health Checks

Access real-time health metrics:
```javascript
const health = client.healthCheck.getHealth();
```

Returns:
- Bot statistics (guilds, users, channels)
- System metrics (CPU, memory, uptime)
- Music player statistics
- WebSocket status and ping

### Logging

Logs are stored in:
- Console output with colors
- `logs/YYYY-MM-DD.log` files

Log levels: `debug`, `info`, `warn`, `error`, `success`

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Always use environment variables
2. **Rotate webhook URLs** - Regenerate if exposed
3. **Use strong passwords** - For Lavalink and databases
4. **Enable rate limiting** - Prevent abuse
5. **Regular updates** - Keep dependencies updated

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### Version 2.0.0 - Ultra-Advanced Update

**Security:**
- ✅ Removed all hardcoded tokens and secrets
- ✅ Implemented environment-based configuration
- ✅ Added comprehensive .gitignore

**Performance:**
- ✅ Advanced caching system with TTL
- ✅ Memory optimization and garbage collection
- ✅ Batch processing for API calls
- ✅ Debounce and throttle utilities

**Monitoring:**
- ✅ Real-time health check system
- ✅ Performance metrics tracking
- ✅ Enhanced logging with file output
- ✅ Error frequency tracking

**Reliability:**
- ✅ Graceful shutdown handlers
- ✅ Enhanced anti-crash system
- ✅ Automatic error recovery
- ✅ Cluster error handling

**Code Quality:**
- ✅ JSDoc documentation
- ✅ Better error messages
- ✅ Consistent code style
- ✅ TypeScript type definitions

## 🐛 Troubleshooting

### Bot Won't Start

1. Check `.env` file exists and has `TOKEN`
2. Verify Node.js version: `node --version` (should be ≥20)
3. Check Lavalink is running: `http://localhost:2333`

### Music Not Playing

1. Verify Lavalink connection in logs
2. Check bot has voice permissions
3. Ensure Lavalink configuration is correct

### High Memory Usage

1. Enable garbage collection: `node --expose-gc src/index.js`
2. Reduce cache TTL in performance optimizer
3. Clear guild caches periodically

## 📞 Support

- **Discord Server**: [Join Here](https://discord.gg/p6nXDJMeyc)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nerox/issues)
- **Email**: support@codes-for.fun

## 📜 License

This project is licensed under a custom license. See LICENSE file for details.

## 👏 Acknowledgments

- [Discord.js](https://discord.js.org) - Discord API wrapper
- [Kazagumo](https://github.com/Takiyo0/Kazagumo) - Music player
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Audio server
- [discord-hybrid-sharding](https://github.com/meister03/discord-hybrid-sharding) - Clustering solution

---

<div align="center">
  Made with ❤️ by the Nerox team
  <br>
  <sub>⚡ Ultra-Advanced • 🔒 Secure • 🚀 Performant</sub>
</div>