# 🚀 Deployment Guide

Complete guide for deploying Nerox Discord Music Bot in various environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment](#local-deployment)
- [VPS Deployment](#vps-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: v20.x or higher
- **RAM**: Minimum 512MB, Recommended 2GB+
- **CPU**: 1 core minimum, 2+ cores recommended
- **Storage**: 1GB minimum
- **OS**: Linux (Ubuntu 20.04+), Windows 10+, macOS 10.15+

### Required Services

1. **Lavalink Server**: For music playback
2. **Discord Bot Token**: From Discord Developer Portal
3. **MongoDB** (Optional): For persistent storage

---

## Local Deployment

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/nerox.git
cd nerox
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
```

Fill in required values:
```env
TOKEN=your_discord_bot_token
OWNERS=your_user_id
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

### Step 4: Start Lavalink

Download Lavalink:
```bash
wget https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar
```

Run Lavalink:
```bash
java -jar Lavalink.jar
```

### Step 5: Start Bot

```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

---

## VPS Deployment

### Recommended VPS Providers

- DigitalOcean
- Linode
- Vultr
- AWS EC2
- Google Cloud Platform

### Ubuntu 20.04/22.04 Setup

#### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 3. Install Java (for Lavalink)

```bash
sudo apt install -y openjdk-17-jre-headless
```

#### 4. Install Git

```bash
sudo apt install -y git
```

#### 5. Clone and Setup

```bash
git clone https://github.com/yourusername/nerox.git
cd nerox
npm install
cp .env.example .env
nano .env
```

#### 6. Setup Lavalink as Service

Create service file:
```bash
sudo nano /etc/systemd/system/lavalink.service
```

Add:
```ini
[Unit]
Description=Lavalink Music Server
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/lavalink
ExecStart=/usr/bin/java -jar Lavalink.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable lavalink
sudo systemctl start lavalink
```

#### 7. Setup Bot as Service

Create service file:
```bash
sudo nano /etc/systemd/system/nerox.service
```

Add:
```ini
[Unit]
Description=Nerox Discord Music Bot
After=network.target lavalink.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/nerox
ExecStart=/usr/bin/node /path/to/nerox/src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable nerox
sudo systemctl start nerox
```

#### 8. Setup Process Manager (Alternative to systemd)

Using PM2:
```bash
npm install -g pm2

# Start bot
pm2 start src/index.js --name nerox

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs nerox
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port (if using HTTP server)
# EXPOSE 3000

# Start bot
CMD ["node", "src/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  lavalink:
    image: fredboat/lavalink:latest
    ports:
      - "2333:2333"
    volumes:
      - ./application.yml:/opt/Lavalink/application.yml
    environment:
      - LAVALINK_SERVER_PASSWORD=youshallnotpass
    restart: unless-stopped

  nerox:
    build: .
    depends_on:
      - lavalink
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
      - ./database-storage:/app/database-storage
```

### Build and Run

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f nerox

# Stop services
docker-compose down
```

---

## Cloud Deployment

### Heroku

1. Create `Procfile`:
```
worker: node src/index.js
```

2. Deploy:
```bash
heroku create your-bot-name
heroku config:set TOKEN=your_token
git push heroku main
heroku scale worker=1
```

### Railway.app

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Render.com

1. Create new Web Service
2. Connect repository
3. Set environment variables
4. Deploy

---

## Production Checklist

### Security

- [ ] All secrets in `.env` file
- [ ] `.env` not in version control
- [ ] Strong passwords used
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies are up to date

### Performance

- [ ] Garbage collection enabled (`--expose-gc`)
- [ ] Memory limits set appropriately
- [ ] Caching configured
- [ ] Database indexes created
- [ ] Monitoring enabled

### Reliability

- [ ] Auto-restart configured
- [ ] Logging enabled
- [ ] Health checks implemented
- [ ] Backup strategy in place
- [ ] Error tracking configured

### Configuration

```env
# Production settings
NODE_ENV=production
LOG_LEVEL=info

# Resource limits
MAX_MEMORY=1024
MAX_CLUSTERS=2
```

---

## Monitoring

### Log Files

Logs are stored in `logs/` directory:
```bash
# View latest log
tail -f logs/$(date +%Y-%m-%d).log

# Search for errors
grep "ERROR" logs/*.log
```

### Health Check

```bash
# Using curl (if HTTP server enabled)
curl http://localhost:3000/health

# Using script
npm run health
```

### System Monitoring

```bash
# CPU and Memory usage
pm2 monit

# System resources
htop

# Disk usage
df -h
```

### Metrics

Metrics are exported daily to `metrics/` directory:
```bash
cat metrics/metrics-$(date +%Y-%m-%d).json
```

---

## Troubleshooting

### Bot Won't Start

**Check logs:**
```bash
pm2 logs nerox
# or
systemctl status nerox
```

**Common issues:**
- Missing `.env` file
- Invalid token
- Node.js version too old
- Lavalink not running

### High Memory Usage

**Enable garbage collection:**
```bash
node --expose-gc src/index.js
```

**Monitor memory:**
```bash
pm2 monit
```

**Reduce memory:**
- Decrease cache TTL
- Reduce number of clusters
- Clear guild caches regularly

### Music Not Playing

**Check Lavalink:**
```bash
systemctl status lavalink
curl http://localhost:2333
```

**Verify configuration:**
- Lavalink host and port correct
- Password matches
- Bot has voice permissions

### High CPU Usage

**Check metrics:**
```javascript
const metrics = client.metrics.getMetrics();
console.log(metrics);
```

**Optimize:**
- Reduce cluster count
- Enable caching
- Optimize database queries

### Connection Issues

**Check network:**
```bash
ping discord.com
curl -I https://discord.com/api/v10
```

**Verify:**
- Internet connection stable
- Firewall rules allow outbound
- DNS resolving correctly

---

## Backup and Restore

### Backup Database

```bash
# Local database
tar -czf backup-$(date +%Y%m%d).tar.gz database-storage/

# MongoDB
mongodump --uri="mongodb://localhost:27017/nerox" --out=backup/
```

### Restore Database

```bash
# Local database
tar -xzf backup-20240101.tar.gz

# MongoDB
mongorestore --uri="mongodb://localhost:27017/nerox" backup/
```

---

## Scaling

### Horizontal Scaling

The bot automatically uses clustering:
```javascript
// In src/index.js
totalClusters: availableParallelism()
```

### Vertical Scaling

Increase resources:
- Add more RAM
- Add more CPU cores
- Use faster storage

---

## Updates

### Update Bot

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart bot
pm2 restart nerox
# or
sudo systemctl restart nerox
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Audit security
npm audit
npm audit fix
```

---

## Support

Need help with deployment?

- **Documentation**: Read the full README.md
- **Discord**: https://discord.gg/p6nXDJMeyc
- **Issues**: https://github.com/yourusername/nerox/issues
- **Email**: support@codes-for.fun

---

Made with ❤️ by the Nerox team
