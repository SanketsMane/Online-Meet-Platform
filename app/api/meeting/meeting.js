'use strict';

async function getMeeting() {
    try {
        // Use dynamic import with await
        const { default: fetch } = await import('node-fetch');

        const API_KEY_SECRET = 'kidokoolsfu_default_secret';
        const KIDOKOOL_URL = 'https://sfu.kidokool.com/api/v1/meeting';
        // const KIDOKOOL_URL = 'http://localhost:3010/api/v1/meeting';

        const response = await fetch(KIDOKOOL_URL, {
            method: 'POST',
            headers: {
                authorization: API_KEY_SECRET,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (data.error) {
            console.log('Error:', data.error);
        } else {
            console.log('meeting:', data.meeting);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getMeeting();
