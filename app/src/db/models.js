'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const Tenant = sequelize.define('Tenant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // 'admin', 'user'
    },
    plan: {
        type: DataTypes.STRING,
        defaultValue: 'free',
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active', // 'active', 'banned'
    },
});

const ApiKey = sequelize.define('ApiKey', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scopes: {
        type: DataTypes.JSON, // Array of strings
        defaultValue: [],
    },
    last_used_at: {
        type: DataTypes.DATE,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

const Webhook = sequelize.define('Webhook', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    },
    events: {
        type: DataTypes.JSON, // Array of event names
        defaultValue: [],
    },
    secret: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const UsageLog = sequelize.define('UsageLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    action: {
        type: DataTypes.STRING, // e.g., 'create_meeting'
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'success',
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    room_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    peer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Associations
Tenant.hasMany(ApiKey, { foreignKey: 'tenant_id' });
ApiKey.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(Webhook, { foreignKey: 'tenant_id' });
Webhook.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(UsageLog, { foreignKey: 'tenant_id' });
UsageLog.belongsTo(Tenant, { foreignKey: 'tenant_id' });

ApiKey.hasMany(UsageLog, { foreignKey: 'api_key_id' });
UsageLog.belongsTo(ApiKey, { foreignKey: 'api_key_id' });

// Methods
Tenant.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

const GlobalSetting = sequelize.define('GlobalSetting', {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = { Tenant, ApiKey, Webhook, UsageLog, Feedback, GlobalSetting };
