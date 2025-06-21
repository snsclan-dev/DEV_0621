const axios = require('axios');

const useAxios = axios.create({
    timeout: 10000,
    headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    }
})

module.exports = useAxios;