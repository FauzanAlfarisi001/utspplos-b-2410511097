const rateLimit = require('express-rate-limit');
require('dotenv').config();

// limit/pembatas req
module.exports = rateLimit({
    // 60 req /menit 1 ip
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(process.env.RATE_LIMIT_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    message: {message: 'Terlalu banyak request, coba lagi 1 menit kedepan.', statusCode: 429 },
});