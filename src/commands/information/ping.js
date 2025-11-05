/** @format */

import { Command } from "../../classes/abstract/command.js";
import Canvas from "canvas";
import { AttachmentBuilder } from "discord.js";

export default class Ping extends Command {
  constructor() {
    super(...arguments);
    this.aliases = ["latency", "pong", "ms"];
    this.description = "⚡ Real-time latency monitoring with visual stats";
  }

  execute = async (client, ctx) => {
    try {
      const msg = await ctx.reply({ 
        content: `${client.emoji.timer} Analyzing network performance...` 
      });

      const start = performance.now();
      await client.db.blacklist.set("test", true);
      await client.db.blacklist.get("test");
      await client.db.blacklist.delete("test");
      const dbLatency = (performance.now() - start).toFixed(2);

      const wsLatency = client.ws.ping.toFixed(2);
      const msgLatency = msg.createdTimestamp - ctx.createdTimestamp;

      // Enhanced Canvas
      const canvas = Canvas.createCanvas(700, 350);
      const ctxCanvas = canvas.getContext("2d");

      // Modern gradient background
      const gradient = ctxCanvas.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#5865F2");
      gradient.addColorStop(0.5, "#3b4db8");
      gradient.addColorStop(1, "#1e2761");
      ctxCanvas.fillStyle = gradient;
      ctxCanvas.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle pattern
      ctxCanvas.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let i = 0; i < canvas.width; i += 40) {
        ctxCanvas.fillRect(i, 0, 20, canvas.height);
      }

      // Title with shadow
      ctxCanvas.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctxCanvas.shadowBlur = 10;
      ctxCanvas.fillStyle = "#ffffff";
      ctxCanvas.font = "bold 38px 'Segoe UI', Arial";
      ctxCanvas.fillText("⚡ Network Statistics", 35, 60);
      ctxCanvas.shadowBlur = 0;

      // Stats with improved styling
      const stats = [
        { label: "WebSocket", value: `${wsLatency} ms`, color: wsLatency < 100 ? "#57F287" : wsLatency < 200 ? "#FEE75C" : "#ED4245" },
        { label: "Database", value: `${dbLatency} ms`, color: dbLatency < 50 ? "#57F287" : dbLatency < 150 ? "#FEE75C" : "#ED4245" },
        { label: "Response", value: `${msgLatency} ms`, color: msgLatency < 100 ? "#57F287" : msgLatency < 300 ? "#FEE75C" : "#ED4245" }
      ];

      stats.forEach((stat, i) => {
        const yPos = 130 + i * 70;
        
        // Stat container
        ctxCanvas.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctxCanvas.roundRect(35, yPos - 35, 630, 55, 10);
        ctxCanvas.fill();

        // Label
        ctxCanvas.fillStyle = "#b9bbbe";
        ctxCanvas.font = "24px 'Segoe UI', Arial";
        ctxCanvas.fillText(`${stat.label}:`, 55, yPos);

        // Value with color indicator
        ctxCanvas.fillStyle = stat.color;
        ctxCanvas.font = "bold 28px 'Segoe UI', Arial";
        ctxCanvas.fillText(stat.value, 480, yPos);

        // Status dot
        ctxCanvas.beginPath();
        ctxCanvas.arc(430, yPos - 8, 8, 0, Math.PI * 2);
        ctxCanvas.fillStyle = stat.color;
        ctxCanvas.fill();
      });

      // Footer
      ctxCanvas.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctxCanvas.font = "16px 'Segoe UI', Arial";
      ctxCanvas.fillText(`Shard #${ctx.guild?.shardId || 0} • Cluster optimized`, 35, 330);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "latency.png" });

      await msg.edit({ 
        content: `${client.emoji.check} **Performance metrics retrieved!**`, 
        files: [attachment] 
      });
    } catch (error) {
      client.log(`Ping command error: ${error.message}`, 'error');
      await ctx.reply({
        content: `${client.emoji.cross} Failed to measure latency!`
      }).catch(() => {});
    }
  };
}