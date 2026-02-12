const os = require('os-utils');

/**
 * StatsService.js
 * Collects real-time system metrics for the Admin Dashboard.
 */
class StatsService {
    constructor() {
        this.history = {
            cpu: [],
            memory: [],
            timestamps: []
        };
        this.maxHistory = 60; // Keep 60 seconds of data
    }

    getSystemStats() {
        return new Promise((resolve) => {
            os.cpuUsage((cpuPercent) => {
                const stats = {
                    cpu: (cpuPercent * 100).toFixed(2),
                    memory: {
                        total: os.totalmem(),
                        free: os.freemem(),
                        used: os.totalmem() - os.freemem(),
                        usagePercent: ((1 - os.freememPercentage()) * 100).toFixed(2)
                    },
                    uptime: os.sysUptime(),
                    timestamp: Date.now()
                };
                
                // Update history
                this.updateHistory(stats);
                
                resolve(stats);
            });
        });
    }

    updateHistory(stats) {
        this.history.timestamps.push(stats.timestamp);
        this.history.cpu.push(stats.cpu);
        this.history.memory.push(stats.memory.usagePercent);

        if (this.history.timestamps.length > this.maxHistory) {
            this.history.timestamps.shift();
            this.history.cpu.shift();
            this.history.memory.shift();
        }
    }

    getHistory() {
        return this.history;
    }
}

module.exports = new StatsService();
