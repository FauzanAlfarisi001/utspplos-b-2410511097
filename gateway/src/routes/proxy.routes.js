const {createProxyMiddleware} = require('http-proxy-middleware');
const router = require('express').Router();
require('dotenv').config();

const AUTH_URL = process.env.AUTH_SERVICE_URL;
const COMPLAINT_URL = process.env.COMPLAINT_SERVICE_URL;
const DISPOSITION_URL = process.env.DISPOSITION_SERVICE_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL;

// hubungkan ke ke service lain
function proxy(target, pathRewrite) {
    return createProxyMiddleware({target, changeOrigin: true,pathRewrite,
        on: {
            error: (err, _req, res) => {res.status(502).json({message: 'Service tidak tersedia.', error: err.message});
        },},
    });
}

router.use('/api/auth', proxy(AUTH_URL));
router.use('/api/complaints', proxy(COMPLAINT_URL));
router.use('/api/dispositions', proxy(DISPOSITION_URL));
router.use('/api/notifications', proxy(NOTIFICATION_URL));

module.exports = router;