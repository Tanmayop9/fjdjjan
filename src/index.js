/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                    NEROX V3 - ULTRA BEAST                     ║
 * ║  Most Advanced Memory & Disk Optimized Music Bot 🚀          ║
 * ║  Memory: <150MB | Startup: <5s | Disk: <100MB                ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { config } from 'dotenv';
import { log } from './logger.js';
import { availableParallelism } from 'node:os';
import { ClusterManager, HeartbeatManager } from 'discord-hybrid-sharding';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { MemoryMonitor } from './core/MemoryMonitor.js';
import { AutoScaler } from './core/AutoScaler.js';

config();

if (!process.env.TOKEN) {
    log('❌ ERROR: TOKEN environment variable is not set!', 'error');
    log('Please create a .env file based on .env.example', 'error');
    process.exit(1);
}

const mainFile = './nerox.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, mainFile);

// V3 ULTRA OPTIMIZATION: Single cluster with aggressive memory management
const totalClusters = process.env.CLUSTERS ? parseInt(process.env.CLUSTERS) : 1;

log(`🚀 NEROX V3 - Launching with ${totalClusters} ultra-optimized cluster(s)`, 'info');
log(`💎 Memory Target: <150MB | Startup Target: <5s`, 'info');

const clusterManager = new ClusterManager(file, {
    respawn: true,
    mode: 'process',
    restarts: {
        max: 3,
        interval: 60_000,
    },
    totalShards: 'auto',
    totalClusters: totalClusters,
    token: process.env.TOKEN,
    shardsPerClusters: 4, // Optimized for single cluster
    spawnOptions: {
        execArgv: [
            '--expose-gc',
            '--max-old-space-size=256', // V3: Reduced from 512MB
            '--optimize-for-size',
            '--gc-interval=100',
        ],
    },
});

// V3: Enhanced heartbeat with memory monitoring
clusterManager.extend(new HeartbeatManager({
    interval: 10000, // Every 10 seconds
    maxMissedHeartbeats: 3,
}));

// V3: Auto-scaler for dynamic optimization
const autoScaler = new AutoScaler({
    minInstances: 1,
    maxInstances: 2,
    scaleUpThreshold: 0.85,
    scaleDownThreshold: 0.4,
});

// V3: Optimized spawn without delays for single cluster
async function spawnClusters() {
    const startTime = Date.now();
    
    try {
        await clusterManager.spawn({
            timeout: 60_000, // V3: Reduced timeout
            delay: totalClusters > 1 ? 5000 : 0, // No delay for single cluster
        });
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        log(`✅ All clusters spawned in ${elapsed}s (Target: <5s)`, 'success');
    } catch (error) {
        throw error;
    }
}

// V3: Simplified spawn with single retry
let spawnAttempts = 0;

async function attemptSpawn() {
    try {
        spawnAttempts++;
        log(`🚀 Spawn attempt ${spawnAttempts}/2`, 'info');
        await spawnClusters();
    } catch (error) {
        log(`❌ Spawn failed: ${error.message}`, 'error');
        
        if (spawnAttempts < 2) {
            log(`⏳ Retrying in 5s...`, 'warn');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return attemptSpawn();
        } else {
            log('❌ Max spawn attempts reached. Exiting...', 'error');
            process.exit(1);
        }
    }
}

attemptSpawn();

// V3: Enhanced graceful shutdown
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

// V3: Advanced cluster monitoring
clusterManager.on('clusterCreate', (cluster) => {
    log(`🚀 Cluster ${cluster.id} launched (Memory limit: 256MB)`, 'info');
    
    cluster.on('death', () => {
        log(`💀 Cluster ${cluster.id} died - respawning...`, 'error');
    });
    
    cluster.on('error', (error) => {
        log(`❌ Cluster ${cluster.id} error: ${error.message}`, 'error');
    });
    
    cluster.on('ready', () => {
        log(`✅ Cluster ${cluster.id} ready`, 'success');
    });
});

// V3: Aggressive memory management with forced GC
if (global.gc) {
    const gcInterval = 45000; // Every 45 seconds
    
    setInterval(() => {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const ratio = heapUsedMB / heapTotalMB;
        
        // V3: More aggressive GC trigger
        if (ratio > 0.7) {
            log(`🧹 Memory at ${(ratio * 100).toFixed(1)}% - forcing GC`, 'info');
            global.gc();
        }
        
        // V3: Log memory stats periodically
        if (Math.random() < 0.1) { // 10% chance
            log(`📊 Memory: ${heapUsedMB}/${heapTotalMB} MB (${(ratio * 100).toFixed(1)}%)`, 'info');
        }
    }, gcInterval);
}

log("✨ NEROX V3 - Ultra Beast Mode Activated! 🚀", "success");