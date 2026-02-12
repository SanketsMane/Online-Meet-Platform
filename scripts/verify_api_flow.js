const axios = require('axios');

const API_URL = 'http://localhost:3010/api/v1';

async function verify() {
    try {
        // 1. Register
        const email = `dev_${Date.now()}@test.com`;
        const password = 'password123';
        console.log(`Registering ${email}...`);
        await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Dev',
            email,
            password
        });

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        const token = loginRes.data.token;
        console.log('Got JWT Token');

        // 3. Generate Key
        console.log('Generating API Key...');
        const keyRes = await axios.post(`${API_URL}/keys`, {
            name: 'Test Key'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const apiKey = keyRes.data.apiKey;
        console.log('Got API Key:', apiKey);

        // 4. Create Meeting
        console.log('Creating Meeting with API Key...');
        const meetingRes = await axios.post(`${API_URL}/meeting`, {}, {
            headers: { 'x-api-key': apiKey }
        });
        console.log('Meeting Created:', meetingRes.data.meeting);

        // 5. Revoke Key
        const keyId = keyRes.data.apiKey.split('.')[0]; // Prefix is used for ID lookup in some contexts, but let's get actual ID
        // Actually we need the UUID from the list keys
        const listKeysRes = await axios.get(`${API_URL}/keys`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const keyObj = listKeysRes.data.find(k => k.prefix === keyId);
        
        console.log('Revoking Key...');
        await axios.patch(`${API_URL}/keys/${keyObj.id}`, { is_active: false }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 6. Verify Revoked Key Fails
        console.log('Verifying Revoked Key Fails...');
        try {
            await axios.post(`${API_URL}/meeting`, {}, {
                headers: { 'x-api-key': apiKey }
            });
            throw new Error('Revoked key should have failed');
        } catch (err) {
            if (err.response?.status === 401 && err.response.data.message === 'API Key is deactivated') {
                console.log('SUCCESS: Revoked key rejected correctly');
            } else {
                throw err;
            }
        }

        // 7. Delete Key
        console.log('Deleting Key...');
        await axios.delete(`${API_URL}/keys/${keyObj.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 8. Verify Deleted Key Fails
        console.log('Verifying Deleted Key Fails...');
        try {
            await axios.post(`${API_URL}/meeting`, {}, {
                headers: { 'x-api-key': apiKey }
            });
            throw new Error('Deleted key should have failed');
        } catch (err) {
            if (err.response?.status === 401 && err.response.data.message === 'API Key not found') {
                console.log('SUCCESS: Deleted key rejected correctly');
            } else {
                throw err;
            }
        }

        console.log('ALL VERIFICATIONS SUCCESSFUL');
    } catch (err) {
        console.error('VERIFICATION FAILED');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

verify();
