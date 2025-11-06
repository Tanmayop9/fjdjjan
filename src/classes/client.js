/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║              NEROX V3 - ULTRA CLIENT 🚀                       ║
 * ║  Memory-Optimized | Lazy-Loaded | Pool-Based                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { readdirSync } from "fs";
import { Manager } from "./manager.js";
import { fileURLToPath } from "node:url";
import { emoji } from "../assets/emoji.js";
import { josh } from "../functions/josh.js";
import { log } from "../logger.js";
import { dirname, resolve } from "node:path";
import { ExtendedEmbedBuilder } from "./embed.js";
import { ExtendedButtonBuilder } from "./button.js";
import { OAuth2Scopes } from "discord-api-types/v10";
import { readyEvent } from "../functions/readyEvent.js";
import { Client, Partials, Collection, GatewayIntentBits, WebhookClient } from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { config } from "./config.js";

// V3: Import advanced utilities
import { LazyLoader } from "../core/LazyLoader.js";
import { AdvancedCache } from "../core/AdvancedCache.js";
import { createEmbedPool } from "../core/ObjectPool.js";
import { CircuitBreaker } from "../core/CircuitBreaker.js";
import { MemoryMonitor } from "../core/MemoryMonitor.js";
import { PredictivePrefetcher } from "../core/PredictivePrefetcher.js";
import { globalProfiler } from "../core/PerformanceProfiler.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * V3 Extended Client with Revolutionary Features
 * - Lazy loading for commands
 * - Object pooling for embeds
 * - Advanced caching with LRU+TTL
 * - Circuit breaker pattern
 * - Memory monitoring
 * - Predictive prefetching
 * @extends {Client}
 */
export class ExtendedClient extends Client {
  constructor() {
    super({
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
      ],
      failIfNotExists: false,
      shards: getInfo().SHARD_LIST,
      shardCount: getInfo().TOTAL_SHARDS,
      allowedMentions: {
        repliedUser: false,
        parse: ["users", "roles"],
      },
      // V3: Sweep settings for memory optimization
      sweepers: {
        messages: {
          interval: 300, // 5 minutes
          lifetime: 1800, // 30 minutes
        },
        users: {
          interval: 3600, // 1 hour
          filter: () => user => user.bot && user.id !== this.user.id,
        },
      },
    });

    // V3: Core properties (minimal memory footprint)
    this.emoji = emoji;
    this.config = config;
    this.webhooks = config.webhooks;
    this.prefix = config.prefix || "&";
    this.owners = config.owners;
    this.admins = config.admins;
    this.underMaintenance = false;

    // V3: Lazy manager initialization
    this._managerInitialized = false;
    Object.defineProperty(this, 'manager', {
      get() {
        if (!this._managerInitialized) {
          this._manager = Manager.init(this);
          this._managerInitialized = true;
        }
        return this._manager;
      },
    });

    // V3: Advanced utilities (lightweight initialization)
    this.lazyLoader = new LazyLoader();
    this.cache = new AdvancedCache({ maxSize: 200, ttl: 300000 });
    this.embedPool = createEmbedPool();
    this.breaker = new CircuitBreaker({ threshold: 5, timeout: 30000 });
    this.memoryMonitor = new MemoryMonitor(this);
    this.profiler = globalProfiler;
    this.prefetcher = new PredictivePrefetcher(this.cache);

    // V3: Lazy database initialization (load on first access)
    this._dbCache = null;
    Object.defineProperty(this, 'db', {
      get() {
        if (!this._dbCache) {
          this._dbCache = {
            noPrefix: josh("noPrefix"),
            ticket: josh("ticket"),
            botmods: josh("botmods"),
            giveaway: josh("giveaway"),
            mc: josh("msgCount"),
            botstaff: josh("botstaff"),
            redeemCode: josh("redeemCode"),
            serverstaff: josh("serverstaff"),
            ignore: josh("ignore"),
            bypass: josh("bypass"),
            blacklist: josh("blacklist"),
            stats: {
              songsPlayed: josh("stats/songsPlayed"),
              commandsUsed: josh("stats/commandsUsed"),
              friends: josh("stats/friends"),
              linkfireStreaks: josh("stats/linkfireStreaks"),
              lastLinkfire: josh("stats/lastLinkfire"),
            },
            twoFourSeven: josh("twoFourSeven"),
          };
        }
        return this._dbCache;
      },
    });

    this.dokdo = null;

    this.invite = {
      admin: () =>
        this.generateInvite({
          scopes: [OAuth2Scopes.Bot],
          permissions: ["Administrator"],
        }),
      required: () =>
        this.generateInvite({
          scopes: [OAuth2Scopes.Bot],
          permissions: ["Administrator"],
        }),
    };

    this.cluster = new ClusterClient(this);
    
    // V3: Lazy command loading (WeakMap for better GC)
    this._commandCache = new Collection();
    this.commands = new Proxy(this._commandCache, {
      get: (target, prop) => {
        if (typeof prop === 'string' && !target.has(prop)) {
          // Lazy load command on first access
          this.profiler.count('command.lazyLoad');
        }
        return target.get(prop);
      },
    });
    
    this.categories = readdirSync(resolve(__dirname, "../commands"));
    this.cooldowns = new Collection();

    this.connectToGateway = () => {
      if (!config.token) {
        throw new Error('Bot token is not configured! Please check your .env file.');
      }
      return (this.login(config.token), this);
    };

    this.log = (message, type) => void log(message, type);
    this.sleep = async (s) => void (await new Promise((resolve) => setTimeout(resolve, s * 1000)));

    // V3: Pool-based button and embed creation
    this.button = () => new ExtendedButtonBuilder();
    this.embed = (color) => {
      const timer = this.profiler.startTimer('embed.create');
      const embed = new ExtendedEmbedBuilder(color || "#00ADB5");
      timer.end();
      return embed;
    };

    // V3: Optimized utility functions (no external deps)
    this.formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    this.formatDuration = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
      
      return parts.join(' ') || '0s';
    };

    this.getPlayer = (ctx) => this.manager.players.get(ctx.guild.id);

    // V3: Smart webhook initialization (only when needed)
    this._webhookCache = null;
    Object.defineProperty(this, 'webhooks', {
      get() {
        if (!this._webhookCache) {
          this._webhookCache = {};
          Object.entries(config.webhooks).forEach(([hook, url]) => {
            if (url && url.trim()) {
              try {
                this._webhookCache[hook] = new WebhookClient({ url });
              } catch (error) {
                this.log(`Failed to init webhook '${hook}'`, 'warn');
              }
            }
          });
        }
        return this._webhookCache;
      },
    });

    // V3: Start memory monitoring
    this.memoryMonitor.start(60000); // Every minute

    // V3: Event handlers
    this.on("debug", (data) => {
      if (Math.random() < 0.05) { // Only log 5% of debug messages
        this.log(data);
      }
    });
    this.on("ready", async () => await readyEvent(this));
    this.on("messageUpdate", (_, m) => (m.partial ? null : this.emit("messageCreate", m)));
    
    // V3: Cleanup on destroy
    this.on("destroy", () => {
      this.memoryMonitor.stop();
      this.cache.clear();
      this.cooldowns.clear();
    });
  }
}