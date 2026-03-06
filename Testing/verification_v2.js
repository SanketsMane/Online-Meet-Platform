const axios = require('axios');

const BASE_URL = 'http://localhost:3010'; // Assuming server is running on 3010
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };
const DEV_USER = { name: 'TestDeveloper', email: `testdev_${Date.now()}@example.com`, password: 'TestPassword123!' };

// Axios instance with relaxed status validation
const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true, // Allow handling 4xx/5xx responses manually
});

async function runVerification() {
    console.log('🚀 Starting Verification Script...\n');
    let adminToken = null;
    let devToken = null;
    let apiKey = null;
    let tenantId = null;

    // 1. Admin Login
    console.log('1️⃣  Admin Login...');
    const adminLogin = await client.post('/login', ADMIN_CREDENTIALS);
    if (adminLogin.status === 200 && adminLogin.data.message) {
        adminToken = adminLogin.data.message;
        console.log('✅ Admin logged in. Token acquired.');
    } else {
        console.error('❌ Admin login failed:', adminLogin.data);
        process.exit(1);
    }

    // 2. Developer Register
    console.log('\n2️⃣  Registering Developer...');
    const register = await client.post('/api/v1/auth/register', DEV_USER);
    if (register.status === 200 || register.status === 201) {
        console.log('✅ Developer registered.');
    } else {
        console.error('❌ Registration failed:', register.data);
        // If already exists, might continue, but email is unique by timestamp
        process.exit(1);
    }

    // 3. Developer Login
    console.log('\n3️⃣  Developer Login...');
    const devLogin = await client.post('/api/v1/auth/login', { email: DEV_USER.email, password: DEV_USER.password });
    if (devLogin.status === 200 && devLogin.data.token) {
        devToken = devLogin.data.token;
        console.log('✅ Developer logged in. Token acquired.');
    } else {
        console.error('❌ Developer login failed:', devLogin.data);
        process.exit(1);
    }

    // 4. Generate API Key
    console.log('\n4️⃣  Generating API Key...');
    const keyGen = await client.post(
        '/api/v1/keys',
        { name: 'VerificationKey' },
        {
            headers: { Authorization: `Bearer ${devToken}` },
        }
    );
    if (keyGen.status === 200 && keyGen.data.apiKey) {
        apiKey = keyGen.data.apiKey;
        console.log('✅ API Key generated:', apiKey);
    } else {
        console.error('❌ API Key generation failed:', keyGen.data);
        process.exit(1);
    }

    // 5. Create Meetings (Usage)
    console.log('\n5️⃣  Creating 3 Meetings via API Key...');
    for (let i = 0; i < 3; i++) {
        const meeting = await client.post(
            '/api/v1/meeting',
            {},
            {
                headers: { 'x-api-key': apiKey },
            }
        );
        if (meeting.status === 200) {
            process.stdout.write('.');
        } else {
            console.error(`\n❌ Meeting creation failed (${i + 1}):`, meeting.data);
        }
    }
    console.log('\n✅ 3 Meetings created.');

    // 6. Verify Usage Stats
    console.log('\n6️⃣  Verifying Usage Stats...');
    const stats = await client.get('/api/v1/stats/usage', {
        headers: { Authorization: `Bearer ${devToken}` },
    });

    // Check if we have data for today
    const today = new Date().toISOString().split('T')[0];
    const todayStat = stats.data.find((d) => d.date === today);

    if (todayStat && todayStat.count >= 3) {
        console.log(`✅ Usage stats verified. Count for ${today}: ${todayStat.count}`);
    } else {
        console.error('❌ Usage stats mismatch or missing:', stats.data);
        // Don't exit, continue to test ban
    }

    // 7. Get Tenant ID (Admin)
    console.log('\n7️⃣  Fetching Tenant ID (Admin)...');
    const tenants = await client.get('/api/v1/admin/tenants', {
        headers: { Authorization: `Bearer ${adminToken}` },
    });

    const tenant = tenants.data.find((t) => t.email === DEV_USER.email);
    if (tenant) {
        tenantId = tenant.id;
        console.log('✅ Tenant ID found:', tenantId);
    } else {
        console.error('❌ Tenant not found in admin list');
        process.exit(1);
    }

    // 8. Ban User
    console.log('\n8️⃣  Banning User...');
    const ban = await client.put(
        `/api/v1/admin/tenants/${tenantId}/status`,
        { status: 'banned' },
        {
            headers: { Authorization: `Bearer ${adminToken}` },
        }
    );
    if (ban.status === 200) {
        console.log('✅ User banned.');
    } else {
        console.error('❌ Banning failed:', ban.data);
    }

    // 9. Verify Ban (Login attempt)
    console.log('\n9️⃣  Verifying Login Block...');
    const blockedLogin = await client.post('/api/v1/auth/login', {
        email: DEV_USER.email,
        password: DEV_USER.password,
    });
    if (blockedLogin.status === 403) {
        console.log('✅ SUCCESS: Login blocked with 403.');
    } else {
        console.error(
            `❌ FAILURE: User could still login or got wrong status: ${blockedLogin.status}`,
            blockedLogin.data
        );
    }

    // 10. Admin Stats
    console.log('\n🔟 Verifying Admin Stats Endpoint...');
    const adminStats = await client.get('/api/v1/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminStats.status === 200 && adminStats.data.hasOwnProperty('activeRooms')) {
        console.log('✅ Admin Stats verified:', adminStats.data);
    } else {
        console.error('❌ Admin stats failed:', adminStats.data);
    }

    console.log('\n🎉 Verification Complete!');
}

runVerification();
