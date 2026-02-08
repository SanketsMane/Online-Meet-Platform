'use strict';

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const Logger = require('../Logger');
const log = new Logger('Database');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dataDir, 'database.sqlite'),
    logging: (msg) => log.debug(msg),
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        log.info('Database connection established successfully.');
        await sequelize.sync(); // Sync models
        log.info('Database synced.');
    } catch (error) {
        log.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
