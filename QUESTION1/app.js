require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8080;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const MAX_WINDOW_SIZE = 10;

let prevWinState = [];
let curWinState = []; 

const fetchNumbers = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
};

app.get('/',(req, res)=>{
    res.status(200).json({"message" : "API is Live..."});
})

app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let url;
    switch (numberid) {
        case 'p':
            url = 'http://20.244.56.144/test/prime';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibonacci';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/random';
            break;
        default:
            return res.status(400).json({ error: 'Invalid number ID' });
    }
    const numbers = await fetchNumbers(url);
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
