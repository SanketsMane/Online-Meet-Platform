'use strict';

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const Logger = require('../Logger');
const log = new Logger('Database');

// Database configuration from environment variables
const dialect = process.env.DB_DIALECT || 'sqlite';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'online_meeting';
const storage = process.env.DB_STORAGE || path.join(__dirname, '../../../data/database.sqlite');

// Ensure data directory exists if using sqlite
if (dialect === 'sqlite') {
    const dataDir = path.dirname(path.resolve(storage));
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

let sequelizeOptions = {
    dialect: dialect,
    logging: (msg) => log.debug(msg),
};

if (dialect === 'sqlite') {
    sequelizeOptions.storage = storage;
} else {
    sequelizeOptions.host = host;
    sequelizeOptions.port = port;
    sequelizeOptions.username = username;
    sequelizeOptions.password = password;
    sequelizeOptions.database = database;
}

const sequelize = new Sequelize(sequelizeOptions);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        log.info(`Database connection (${dialect}) established successfully.`);
        await sequelize.sync({ alter: true }); // Sync models
        log.info('Database synced.');
    } catch (error) {
        log.error('Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
