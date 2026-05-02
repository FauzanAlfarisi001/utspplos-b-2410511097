require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimitMiddleware = require('./middlewares/rateLimit.middleware');
const jwtValidation = require('./middlewares/jwtValidation.middleware');
const proxyRoutes = require('./routes/proxy.routes');
const axios = require('axios');
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(rateLimitMiddleware);

// cek/monitoring gateway
app.get('/health', async (_req, res) => {
    const services = {
        auth: 'http://localhost:3001/health',
        disposition: 'http://localhost:3002/health',
        notification: 'http://localhost:3003/health'
    };

    const results = {};

    await Promise.all(Object.entries(services).map(async ([name, url]) => {
        try {
            const response = await axios.get(url);
            results[name] = response.data.status || 'ok';
        } catch (err) {
            results[name] = 'down';
        }
    }));

    res.json({
        gateway: 'ok',
        services: results
    });
});

app.use(jwtValidation);
app.use(proxyRoutes);

// kalau endpointnnya salah/tidak ada
app.use((_req, res) => {
    res.status(404).json({message: 'Endpoint tidak ada.'});
});

// error dari kode/database gatewaynya
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({message: 'Error gateway internal.', error: err.message});
});

app.listen(PORT, ()=>console.log(`API gateway berjalan di port ${PORT}`));