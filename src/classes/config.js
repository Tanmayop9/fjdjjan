import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

/**
 * Application configuration loaded from environment variables
 * @type {Object}
 */
export const config = {
  token: process.env.TOKEN,
  owners: process.env.OWNERS ? process.env.OWNERS.split(',').map(id => id.trim()) : [],
  admins: process.env.ADMINS ? process.env.ADMINS.split(',').map(id => id.trim()) : [],
  prefix: process.env.PREFIX || "&",
  links: {
      support: process.env.SUPPORT_SERVER || "https://discord.gg/p6nXDJMeyc"
  },
  backup: process.env.BACKUP_GUILD || "",
  webhooks: {
    logs: process.env.WEBHOOK_LOGS || "",
    serveradd: process.env.WEBHOOK_SERVER_ADD || "",
    serverchuda: process.env.WEBHOOK_SERVER_REMOVE || "",
    playerLogs: process.env.WEBHOOK_PLAYER_LOGS || ""
  },
  lavalink: {
    host: process.env.LAVALINK_HOST || 'localhost',
    port: parseInt(process.env.LAVALINK_PORT || '2333'),
    password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
    secure: process.env.LAVALINK_SECURE === 'true'
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
  },
  mongodb: {
    uri: process.env.MONGODB_URI || ''
  },
  environment: process.env.NODE_ENV || 'development'
};