'use strict';

async function getMeetings() {
    try {
        // Use dynamic import with await
        const { default: fetch } = await import('node-fetch');

        const API_KEY_SECRET = 'kidokoolsfu_default_secret';
        const KIDOKOOL_URL = 'https://sfu.kidokool.com/api/v1/meetings';
        //const KIDOKOOL_URL = 'http://localhost:3010/api/v1/meetings';

        const response = await fetch(KIDOKOOL_URL, {
            method: 'GET',
            headers: {
                authorization: API_KEY_SECRET,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data.error) {
            console.log('Error:', data.error);
        } else {
            if (data && data.meetings) {
                const meetings = data.meetings;
                const formattedData = JSON.stringify({ meetings }, null, 2);
                console.log(formattedData);
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getMeetings();
