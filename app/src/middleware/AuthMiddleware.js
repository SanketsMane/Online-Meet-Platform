'use strict';

const { ApiKey, Tenant } = require('../db/models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const config = require('../config');
const Logger = require('../Logger');
const log = new Logger('AuthMiddleware');

const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'Missing API Key' });
    }

    try {
        const [prefix, secret] = apiKey.split('.');
        if (!prefix || !secret) {
            return res.status(401).json({ message: 'Invalid API Key format' });
        }

        const keyRecord = await ApiKey.findOne({
            where: { prefix: prefix, is_active: true },
            include: [{ model: Tenant, as: 'Tenant' }],
        });

        if (!keyRecord || !keyRecord.Tenant) {
            return res.status(401).json({ message: 'Invalid API Key' });
        }

        // Validate Hash
        const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
        if (hash !== keyRecord.key_hash) {
            return res.status(401).json({ message: 'Invalid API Key' });
        }

        if (keyRecord.Tenant.status !== 'active') {
             return res.status(403).json({ message: 'Tenant account suspended' });
        }

        // Update usage stats (async, don't await)
        keyRecord.update({ last_used_at: new Date() }).catch(err => log.error('Failed to update key usage', err));

        req.tenant = keyRecord.Tenant;
        req.apiKey = keyRecord;
        next();
    } catch (error) {
        log.error('API Key validation error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Author: Sanket - Decode JWT token with AES decryption
function decodeToken(jwtToken) {
    if (!jwtToken) return null;

    try {
        const secret = process.env.JWT_SECRET || 'kidokoolSfuSecret';
        
        // Verify and decode the JWT token
        const decodedToken = jwt.verify(jwtToken, secret);
        if (!decodedToken || !decodedToken.data) {
            throw new Error('Invalid token');
        }

        // Decrypt the payload using AES decryption
        const decryptedPayload = CryptoJS.AES.decrypt(decodedToken.data, secret).toString(CryptoJS.enc.Utf8);

        // Parse the decrypted payload as JSON
        const payload = JSON.parse(decryptedPayload);

        return payload;
    } catch (error) {
        console.error('Token decode error:', error.message);
        return null;
    }
}

// Author: Sanket - Check if user is admin (from HOST_USERS)
// Format: username:password:displayName:allowedRooms separated by |
async function isAuthPeer(username, password) {
    const hostUsers = process.env.HOST_USERS;
    
    if (!hostUsers) {
        console.error('[isAuthPeer] No HOST_USERS defined');
        return false;
    }
    
    // Split by pipe (|) not comma
    const users = hostUsers.split('|').map(user => {
        const parts = user.trim().split(':');
        return { username: parts[0], password: parts[1] };
    });
    
    const isValid = users.some(user => user.username === username && user.password === password);
    console.log('[isAuthPeer] Checking', username, 'against', users.length, 'users - Result:', isValid);
    return isValid;
}

// Middleware: Check if user is admin
async function isAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Admin access required' });
        }

        const token = authHeader.substring(7);
        const decoded = decodeToken(token);
        
        console.log('[isAdmin] Decoded token:', JSON.stringify(decoded));

        if (!decoded || !decoded.username || !decoded.password) {
            console.error('[isAdmin] Token missing credentials:', decoded);
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Verify user is in HOST_USERS list
        const isPeerValid = await isAuthPeer(decoded.username, decoded.password);
        
        if (!isPeerValid) {
            console.error('[isAdmin] Validation failed for:', decoded.username);
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error('[isAdmin] Auth error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = { validateApiKey, isAdmin };
