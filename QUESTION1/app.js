require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8080;
const MAX_WINDOW_SIZE = 10;

let prevWinState = [];
let curWinState = []; 

const getAuthToken = async () => {
    const url = 'http://20.244.56.144/test/auth';
    const requestBody = {
        companyName: process.env.COMPANY_NAME,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        ownerName: process.env.OWNER_NAME,
        ownerEmail: process.env.OWNER_EMAIL,
        rollNo: process.env.ROLL_NO
    };
    
    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Auth Response:', response.data);
        return response.data.access_token;
    } catch (error) {
        if (error.response) {
            console.error('Error response from API:', error.response.data);
        } else {
            console.error('Error making request:', error.message);
        }
        return null;
    }
};

const fetchNumbers = async (url) => {
    try {
        const accessToken = await getAuthToken();
        if (!accessToken) {
            console.error('Failed to retrieve access token.');
            return [];
        }
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const numbers = response.data.numbers;

        if (Array.isArray(numbers)) {
            return numbers;
        } else {
            console.error('Unexpected response format:', response.data);
            return [];
        }
    } catch (error) {
        if (error.response) {
            console.error('Error response from API:', error.response.status, error.response.data);
        } else {
            console.error('Error fetching numbers:', error.message);
        }
        return [];
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

app.get('/', (req, res) => {
    res.status(200).json({ "message": "API is Live..." });
});

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let url;
    switch (numberid) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/rand';
            break;
        default:
            return res.status(400).json({ error: 'Invalid number ID' });
    }

    const numbers = await fetchNumbers(url);
    console.log(numbers);

    prevWinState = [...curWinState];
    curWinState = [...new Set([...curWinState, ...numbers])]; 
    if (curWinState.length > MAX_WINDOW_SIZE) {
        curWinState = curWinState.slice(-MAX_WINDOW_SIZE);
    }
    const avg = calculateAverage(curWinState);
    res.status(200).json({
        numbers,
        prevWinState,
        curWinState,
        avg,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} ...`);
});
