/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║          NEROX V3 - ULTRA LAZY COMMAND LOADER 🚀             ║
 * ║  Loads commands on-demand for minimal memory footprint       ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * V3: Ultra-optimized command loader with lazy loading
 * Only registers command metadata, loads actual command on execution
 */
export const loadCommands = async (client) => {
    const timer = client.profiler?.startTimer('commands.load');
    const commandRegistry = new Map();
    let totalCommandCount = 0;

    try {
        const categoriesPath = resolve(__dirname, '../commands');
        const categories = await readdir(categoriesPath);

        for (const category of categories) {
            const categoryPath = resolve(categoriesPath, category);
            const files = await readdir(categoryPath);

            for (const file of files) {
                if (!file.endsWith('.js')) continue;

                const commandName = file.split('.')[0].toLowerCase();
                const commandPath = pathToFileURL(resolve(categoryPath, file)).href;

                // V3: Store only metadata and path (lazy loading)
                const commandMeta = {
                    name: commandName,
                    category: category.toLowerCase(),
                    nsfw: category === 'nsfw',
                    owner: category === 'owner',
                    path: commandPath,
                    loaded: false,
                    instance: null,
                };

                commandRegistry.set(commandName, commandMeta);
                totalCommandCount++;
            }
        }

        // V3: Create lazy-loading proxy
        client.commands = new Proxy(commandRegistry, {
            get(target, prop) {
                if (typeof prop === 'string') {
                    const meta = target.get(prop);
                    
                    if (meta && !meta.loaded) {
                        // Async lazy load - will be handled by command handler
                        client.profiler?.count('command.lazyLoadRequest');
                    }
                    
                    return meta;
                }
                
                // Pass through Collection methods
                return target[prop];
            },
        });

        // V3: Add helper methods
        client.getCommand = async (name) => {
            const meta = commandRegistry.get(name);
            if (!meta) return null;

            if (!meta.loaded) {
                const timer = client.profiler?.startTimer(`command.load.${name}`);
                try {
                    const CommandClass = (await import(meta.path)).default;
                    meta.instance = new CommandClass();
                    meta.instance.name = meta.name;
                    meta.instance.category = meta.category;
                    meta.instance.nsfw = meta.nsfw;
                    meta.instance.owner = meta.owner;
                    meta.loaded = true;
                    client.profiler?.count('command.lazyLoad');
                } catch (error) {
                    client.log(`Failed to lazy load command ${name}: ${error.message}`, 'error');
                    return null;
                } finally {
                    timer?.end();
                }
            }

            return meta.instance;
        };

        if (timer) timer.end();
        client.log(`📦 Registered ${totalCommandCount} commands (lazy-loaded)`, 'success');
        
        // V3: Memory optimization - clear unused references
        if (global.gc && Math.random() < 0.1) {
            global.gc();
        }
    } catch (error) {
        client.log(`Error loading commands: ${error.message}`, 'error');
        throw error;
    }
};
