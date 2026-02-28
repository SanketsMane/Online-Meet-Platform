'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../app/src/db/database');

async function verify() {
    console.log('Testing database connection...');
    console.log('Configured Dialect:', process.env.DB_DIALECT || 'sqlite (default)');
    
    try {
        await connectDB();
        console.log('SUCCESS: Database verification completed.');
        process.exit(0);
    } catch (error) {
        console.error('FAILURE: Database verification failed.');
        console.error(error);
        process.exit(1);
    }
}

verify();
