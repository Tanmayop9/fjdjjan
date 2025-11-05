import { config } from 'dotenv';
import { log } from './logger.js';
import { availableParallelism } from 'node:os';
import { ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

// Load Environment Variables
config();

// Validate critical environment variables
if (!process.env.TOKEN) {
    log('❌ ERROR: TOKEN environment variable is not set!', 'error');
    log('Please create a .env file based on .env.example', 'error');
    process.exit(1);
}

const mainFile = './nerox.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, mainFile);

// 🚀 Optimized cluster configuration to prevent OOM and 429 errors
const totalClusters = Math.min(
    process.env.CLUSTERS ? parseInt(process.env.CLUSTERS) : 2,
    Math.max(1, Math.floor(availableParallelism() / 2))
);

log(`🔧 Configuring ${totalClusters} clusters (optimized for stability)`, 'info');

const clusterManager = new ClusterManager(file, {
    respawn: true,
    mode: 'process',
    restarts: {
        max: 5,
        interval: 60_000, // 1 minute between restarts
    },
    totalShards: 'auto',
    totalClusters: totalClusters,
    token: process.env.TOKEN,
    shardsPerClusters: 2,
    spawnOptions: {
        execArgv: ['--max-old-space-size=512'], // Memory limit per cluster
    },
});

// Heartbeat Manager with adjusted settings
clusterManager.extend(new HeartbeatManager({
    interval: 5000, // Increased to reduce API calls
    maxMissedHeartbeats: 3,
}));

// Rate limit handler for cluster spawning
let spawnDelay = 0;
const SPAWN_DELAY_INCREMENT = 5500; // Discord rate limit friendly

async function spawnWithRateLimit() {
    const clusters = [];
    
    for (let i = 0; i < totalClusters; i++) {
        if (i > 0) {
            log(`⏳ Waiting ${SPAWN_DELAY_INCREMENT}ms before spawning cluster ${i}...`, 'info');
            await new Promise(resolve => setTimeout(resolve, SPAWN_DELAY_INCREMENT));
        }
        clusters.push(i);
    }
    
    return clusterManager.spawn({ 
        timeout: 120_000, // 2 minute timeout per cluster
        delay: SPAWN_DELAY_INCREMENT,
    });
}

// Spawn Clusters with exponential backoff retry
let spawnAttempts = 0;
const MAX_SPAWN_ATTEMPTS = 3;

async function attemptSpawn() {
    try {
        spawnAttempts++;
        log(`🚀 Spawn attempt ${spawnAttempts}/${MAX_SPAWN_ATTEMPTS}`, 'info');
        await spawnWithRateLimit();
        log('✅ All clusters spawned successfully!', 'info');
    } catch (error) {
        log(`❌ Spawn attempt ${spawnAttempts} failed: ${error.message}`, 'error');
        
        if (spawnAttempts < MAX_SPAWN_ATTEMPTS) {
            const backoffDelay = Math.min(30000, 5000 * Math.pow(2, spawnAttempts - 1));
            log(`⏳ Retrying in ${backoffDelay}ms...`, 'warn');
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            return attemptSpawn();
        } else {
            log('❌ Max spawn attempts reached. Exiting...', 'error');
            process.exit(1);
        }
    }
}

attemptSpawn();

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    log(`⚠️ Received ${signal}, starting graceful shutdown...`, 'warn');
    
    try {
        await clusterManager.broadcastEval('this.destroy()');
        log('✅ All clusters shut down successfully', 'info');
        process.exit(0);
    } catch (error) {
        log(`❌ Error during shutdown: ${error.message}`, 'error');
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Cluster error handling with enhanced logging
clusterManager.on('clusterCreate', (cluster) => {
    log(`🚀 Cluster ${cluster.id} launched (Memory limit: 512MB)`, 'info');
    
    cluster.on('death', () => {
        log(`💀 Cluster ${cluster.id} died - will respawn if limits not exceeded`, 'error');
    });
    
    cluster.on('error', (error) => {
        log(`❌ Cluster ${cluster.id} error: ${error.message}`, 'error');
        
        // Handle specific error types
        if (error.message.includes('429')) {
            log(`⚠️ Rate limit detected on cluster ${cluster.id} - backing off`, 'warn');
        } else if (error.message.includes('ENOMEM') || error.message.includes('memory')) {
            log(`⚠️ Memory issue on cluster ${cluster.id} - may need to reduce totalClusters`, 'warn');
        }
    });
    
    cluster.on('ready', () => {
        log(`✅ Cluster ${cluster.id} is ready and operational`, 'info');
    });
});

// Memory monitoring
if (global.gc) {
    setInterval(() => {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
        
        if (heapUsedMB > heapTotalMB * 0.9) {
            log(`⚠️ High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`, 'warn');
            global.gc();
        }
    }, 60000); // Check every minute
}

log("✨ Bot cluster manager started successfully!", "info");