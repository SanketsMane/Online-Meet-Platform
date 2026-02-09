'use strict';

const { connectDB } = require('../app/src/db/database');
const { Tenant, ApiKey } = require('../app/src/db/models');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Logger = require('../app/src/Logger');
const log = new Logger('Seed');

const seed = async () => {
    await connectDB();

    // 1. Create Admin
    const adminEmail = 'admin@tawktoo.com';
    const adminPassword = 'adminpassword';
    
    let admin = await Tenant.findOne({ where: { email: adminEmail } });
    if (!admin) {
        const hash = await bcrypt.hash(adminPassword, 10);
        admin = await Tenant.create({
            name: 'Super Admin',
            email: adminEmail,
            password_hash: hash,
            role: 'admin',
            plan: 'unlimited'
        });
        log.info('Created Admin:', adminEmail);
    } else {
        log.info('Admin already exists');
    }

    // 2. Create Developer
    const devEmail = 'dev@example.com';
    const devPassword = 'devpassword';

    let dev = await Tenant.findOne({ where: { email: devEmail } });
    if (!dev) {
        const hash = await bcrypt.hash(devPassword, 10);
        dev = await Tenant.create({
            name: 'Example Developer',
            email: devEmail,
            password_hash: hash,
            role: 'user',
            plan: 'free'
        });
        log.info('Created Developer:', devEmail);
    } else {
        log.info('Developer already exists');
    }

    // 3. Create Key for Developer
    const existingKey = await ApiKey.findOne({ where: { tenant_id: dev.id } });
    if (!existingKey) {
        const rawKey = uuidv4() + '.' + crypto.randomBytes(32).toString('hex');
        const prefix = rawKey.split('.')[0];
        const key_hash = crypto.createHash('sha256').update(rawKey).digest('hex');

        await ApiKey.create({
            tenant_id: dev.id,
            name: 'Seed Key',
            prefix: prefix,
            key_hash: key_hash,
            scopes: ['room:create', 'stats:read'],
            is_active: true
        });
        log.info('Created API Key for Developer:', rawKey);
        log.info('(Save this key, it is only shown once!)');
    } else {
        log.info('Developer already has an API key');
    }

    process.exit(0);
};

seed().catch(err => {
    log.error('Seed failed', err);
    process.exit(1);
});
