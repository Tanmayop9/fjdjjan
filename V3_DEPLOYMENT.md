# 🚀 NEROX V3 - DEPLOYMENT GUIDE

<div align="center">

**Ultra-Optimized Production Deployment**

Memory: <150MB | Startup: <5s | Disk: <100MB

</div>

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Production Optimization](#production-optimization)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 PREREQUISITES

### Required Software

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: Latest version
- **Lavalink**: v3.x or v4.x

### Required Services

- Discord Bot Application
- Lavalink Server (local or hosted)
- (Optional) Spotify API credentials

---

## 💻 SYSTEM REQUIREMENTS

### Minimum Requirements (V3 Optimized)

```yaml
CPU: 1 core @ 2.0 GHz
RAM: 512 MB
Disk: 500 MB free space
Network: Stable internet connection
OS: Linux, Windows, or macOS
```

### Recommended for Production

```yaml
CPU: 2 cores @ 2.5 GHz
RAM: 1 GB
Disk: 2 GB free space
Network: 100 Mbps+
OS: Ubuntu 20.04 LTS or higher
```

---

## 📦 INSTALLATION

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/PAINFUEG0/Fuego.git
cd Fuego

# Checkout V3 branch (if not main)
git checkout v3
```

### Step 2: Install Dependencies

```bash
# Install only production dependencies (9 packages)
npm install --production

# Or install all dependencies (includes dev tools)
npm install
```

### Step 3: Configure Lavalink

#### Option A: Local Lavalink

```bash
# Download Lavalink
wget https://github.com/freyacodes/Lavalink/releases/download/3.7.11/Lavalink.jar

# Create application.yml
cat > application.yml << 'EOF'
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    youtubePlaylistLoadLimit: 6
    playerUpdateInterval: 5
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true
    gc-warnings: true

metrics:
  prometheus:
    enabled: false
    endpoint: /metrics

sentry:
  dsn: ""
  environment: ""

logging:
  level:
    root: INFO
    lavalink: INFO
EOF

# Start Lavalink
java -jar Lavalink.jar
```

#### Option B: Hosted Lavalink

Use a hosted provider like:
- [lavalink.darrenofficial.com](https://lavalink.darrenofficial.com)
- [lavalink.devz.cloud](https://lavalink.devz.cloud)
- [lavalink-v3.herokuapp.com](https://lavalink-v3.herokuapp.com)

---

## ⚙️ CONFIGURATION

### Step 1: Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
```

### Step 2: Configure .env

```env
# ============================================
# NEROX V3 CONFIGURATION
# ============================================

# Discord Bot
TOKEN=your_discord_bot_token_here
PREFIX=&

# Clustering (V3: 1 is optimal)
CLUSTERS=1

# Lavalink Configuration
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false

# Spotify Integration (Optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Bot Configuration
OWNERS=["123456789012345678"]
ADMINS=["123456789012345678"]

# Webhooks (Optional)
ERROR_WEBHOOK=https://discord.com/api/webhooks/...
GUILD_WEBHOOK=https://discord.com/api/webhooks/...
```

### Step 3: Bot Permissions

Required Discord bot permissions:
- `Send Messages`
- `Embed Links`
- `Attach Files`
- `Read Message History`
- `Use External Emojis`
- `Add Reactions`
- `Connect` (Voice)
- `Speak` (Voice)
- `Use Voice Activity`

Invite link template:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=3165184&scope=bot
```

---

## 🚀 PRODUCTION OPTIMIZATION

### Start Scripts

#### Development Mode
```bash
npm start
```

#### Production Mode (Recommended)
```bash
npm run start:prod
```

This runs with optimized flags:
```bash
node --expose-gc --max-old-space-size=256 --optimize-for-size .
```

### Process Manager (Recommended)

#### PM2 Setup

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nerox-v3',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '256M',
    node_args: '--expose-gc --max-old-space-size=256 --optimize-for-size',
    env: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Enable startup script
pm2 startup
```

#### Systemd Service (Alternative)

```bash
# Create service file
sudo cat > /etc/systemd/system/nerox.service << 'EOF'
[Unit]
Description=NEROX V3 Discord Music Bot
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/Fuego
ExecStart=/usr/bin/node --expose-gc --max-old-space-size=256 --optimize-for-size src/index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable nerox
sudo systemctl start nerox

# Check status
sudo systemctl status nerox
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production --ignore-scripts

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 nerox && \
    adduser -D -u 1001 -G nerox nerox && \
    chown -R nerox:nerox /app

# Switch to non-root user
USER nerox

# Expose port (if needed)
# EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "console.log('Health check: OK')"

# Start bot
CMD ["node", "--expose-gc", "--max-old-space-size=256", "--optimize-for-size", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  nerox:
    build: .
    container_name: nerox-v3
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./database-storage:/app/database-storage
      - ./logs:/app/logs
    networks:
      - nerox-network
    mem_limit: 512m
    cpus: 1.0

  lavalink:
    image: fredboat/lavalink:latest
    container_name: lavalink
    restart: unless-stopped
    ports:
      - "2333:2333"
    volumes:
      - ./application.yml:/opt/Lavalink/application.yml
    networks:
      - nerox-network
    mem_limit: 1g

networks:
  nerox-network:
    driver: bridge
```

---

## 📊 MONITORING

### Built-in Metrics

Access performance metrics:

```javascript
// In bot console or via command
const report = client.profiler.report();
console.log(JSON.stringify(report, null, 2));
```

### Memory Monitoring

```javascript
// Get memory stats
const memStats = client.memoryMonitor.stats;
console.log(memStats);
```

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs nerox-v3

# Status
pm2 status
```

### External Monitoring (Optional)

Integrate with:
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Discord Webhooks** - Error alerts
- **Uptime Robot** - Availability monitoring

---

## 🔍 TROUBLESHOOTING

### Common Issues

#### Bot Not Starting

```bash
# Check environment variables
cat .env

# Verify Node.js version
node --version

# Check for errors
npm start 2>&1 | tee startup.log
```

#### Memory Issues

```bash
# Check memory usage
ps aux | grep node

# Force garbage collection
kill -USR2 $(pidof node)

# Restart with more memory (if needed)
node --max-old-space-size=384 src/index.js
```

#### Connection Issues

```bash
# Test Lavalink connection
curl http://localhost:2333/version

# Check firewall
sudo ufw status

# Verify Discord token
echo $TOKEN
```

#### High CPU Usage

```bash
# Check process
top -p $(pidof node)

# Profile performance
node --prof src/index.js

# Analyze profile
node --prof-process isolate-*.log > processed.txt
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Or specific namespace
DEBUG=discord.js:* npm start
```

### Getting Help

1. **Check Logs**
   ```bash
   tail -f logs/output.log
   tail -f logs/error.log
   ```

2. **Join Support Server**
   - Discord: [Support Server](https://discord.gg/your-invite)

3. **GitHub Issues**
   - [Report Bug](https://github.com/PAINFUEG0/Fuego/issues/new)

---

## 🔐 SECURITY

### Best Practices

1. **Never commit .env file**
   ```bash
   # Ensure .gitignore includes
   echo ".env" >> .gitignore
   ```

2. **Use environment variables for secrets**
   ```bash
   # Not in code!
   const token = process.env.TOKEN;
   ```

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

4. **Run as non-root user**
   ```bash
   sudo -u neroxuser npm start
   ```

5. **Enable firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 2333/tcp
   ```

---

## 📈 SCALING

### Horizontal Scaling

```env
# Increase clusters (if needed)
CLUSTERS=2
```

### Vertical Scaling

```bash
# Increase memory limit
node --max-old-space-size=384 src/index.js
```

### Load Balancing

Use reverse proxy (Nginx/HAProxy) if running multiple instances.

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Lavalink server running
- [ ] Bot token valid
- [ ] Bot invited to servers
- [ ] PM2 or systemd service configured
- [ ] Logs directory created
- [ ] Firewall configured
- [ ] Memory monitoring enabled
- [ ] Backup system in place
- [ ] Support server joined

---

## 🎉 SUCCESS!

Your NEROX V3 bot should now be running with:
- ✅ Memory usage < 150MB
- ✅ Startup time < 5s
- ✅ Disk space < 100MB
- ✅ Ultra-fast response times

Enjoy your ultra-optimized music bot! 🚀

---

<div align="center">

**Made with 💖 by the NEROX Team**

*Stay different. Stay optimized. Stay NEROX V3.*

</div>
