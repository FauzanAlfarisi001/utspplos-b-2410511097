require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimitMiddleware = require('./middlewares/rateLimit.middleware');
const jwtValidation = require('./middlewares/jwtValidation.middleware');
const proxyRoutes = require('./routes/proxy.routes');
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(rateLimitMiddleware);
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

// cek/monitoring gateway
app.get('/health', (_req, res) => res.json({
    status: 'ok',
    service: 'api-gateway',
    routing: {
        '/api/auth': 'auth-service:3001',
        '/api/complaints': 'complaint-service:8080',
        '/api/dispositions': 'disposition-service:3002',
        '/api/notifications': 'notification-service:3003',
    }
}));

app.listen(PORT, ()=>console.log(`API gateway berjalan di port ${PORT}`));