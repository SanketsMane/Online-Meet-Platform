'use strict';

const { GlobalSetting } = require('../db/models');
const config = require('../config');
const Logger = require('../Logger');
const log = new Logger('SettingsService');

class SettingsService {
    constructor() {
        this.cache = {};
        this.lastFetch = 0;
        this.ttl = 60000; // 1 minute cache
    }

    /**
     * Get a setting by key, with fallback to config.js
     * @param {string} key 
     * @returns {any}
     */
    async get(key) {
        // Return from cache if valid
        if (this.cache[key] !== undefined && Date.now() - this.lastFetch < this.ttl) {
            return this.cache[key];
        }

        try {
            const setting = await GlobalSetting.findByPk(key);
            if (setting) {
                // Parse JSON if applicable
                try {
                    this.cache[key] = JSON.parse(setting.value);
                } catch (e) {
                    this.cache[key] = setting.value;
                }
            } else {
                // Fallback to config.js
                this.cache[key] = this.getFallback(key);
            }
            
            this.lastFetch = Date.now();
            return this.cache[key];
        } catch (error) {
            log.error(`Error fetching setting ${key}:`, error);
            return this.getFallback(key);
        }
    }

    /**
     * Get all settings relevant for admin dashboard
     */
    async getAll() {
        const keys = [
            'CHATGPT_ENABLED',
            'CHATGPT_API_KEY',
            'CHATGPT_MODEL',
            'CHATGPT_MAX_TOKENS',
            'CHATGPT_TEMPERATURE',
            'DEEPSEEK_ENABLED',
            'DEEPSEEK_API_KEY',
            'FOOTER_CONFIG',
        ];

        const settings = {};
        for (const key of keys) {
            settings[key] = await this.get(key);
        }
        return settings;
    }

    /**
     * Update a setting
     * @param {string} key 
     * @param {any} value 
     */
    async set(key, value) {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            await GlobalSetting.upsert({ key, value: stringValue });
            this.cache[key] = value;
            log.info(`Updated setting ${key}`);
        } catch (error) {
            log.error(`Error updating setting ${key}:`, error);
            throw error;
        }
    }

    /**
     * Fallback values from config.js or process.env
     */
    getFallback(key) {
        switch (key) {
            case 'CHATGPT_ENABLED':
                return config.integrations?.chatGPT?.enabled;
            case 'CHATGPT_API_KEY':
                return config.integrations?.chatGPT?.apiKey;
            case 'CHATGPT_MODEL':
                return config.integrations?.chatGPT?.model || 'gpt-3.5-turbo';
            case 'CHATGPT_MAX_TOKENS':
                return config.integrations?.chatGPT?.max_tokens || 1024;
            case 'CHATGPT_TEMPERATURE':
                return config.integrations?.chatGPT?.temperature || 0.7;
            case 'DEEPSEEK_ENABLED':
                return config.integrations?.deepSeek?.enabled;
            case 'DEEPSEEK_API_KEY':
                return config.integrations?.deepSeek?.apiKey;
            case 'FOOTER_CONFIG':
                return {
                    copyright: '© 2026 tawktoo',
                    contactEmail: 'sanketmane7170@gmail.com',
                    links: [
                        { label: 'Home', url: '/' },
                        { label: 'About', url: '/about' },
                        { label: 'Privacy', url: '/privacy' }
                    ]
                };
            default:
                return null;
        }
    }
}

module.exports = new SettingsService();
