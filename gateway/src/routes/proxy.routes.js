const {createProxyMiddleware} = require('http-proxy-middleware');
const router = require('express').Router();
const requireRole = require('../middlewares/roleGuard.middleware');
require('dotenv').config();

const AUTH_URL = process.env.AUTH_SERVICE_URL;
const COMPLAINT_URL = process.env.COMPLAINT_SERVICE_URL;
const DISPOSITION_URL = process.env.DISPOSITION_SERVICE_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL;

// hubungkan ke ke service lain
function proxy(target, basePath) {
    return createProxyMiddleware({target, changeOrigin: true,
        pathRewrite: (path, req) => {
            if (path.startsWith(basePath)) {
                return path;
            }
            return basePath + path;
        }, logLevel: 'debug',
        on: {
            error: (err, _req, res) => {res.status(502).json({message: 'Service tidak tersedia.', error: err.message});
        },},
    });
}

router.use('/api/auth', proxy(AUTH_URL, '/api/auth'));

// admin
router.delete('/api/complaints/:id',requireRole('admin'), proxy(COMPLAINT_URL, '/api/complaints')); // delete gak motong bagian prefix depan
router.post('/api/dispositions/units', requireRole('admin'), proxy(DISPOSITION_URL, '/api/dispositions'));

// admin dan staff
router.post('/api/categories',requireRole('admin', 'staff'),proxy(COMPLAINT_URL, '/api/categories'));
router.post('/api/dispositions', requireRole('admin', 'staff'), proxy(DISPOSITION_URL, '/api/dispositions'));

router.use('/api/complaints', proxy(COMPLAINT_URL, '/api/complaints'));
router.use('/api/categories', proxy(COMPLAINT_URL, '/api/categories'));

router.use('/api/dispositions', proxy(DISPOSITION_URL, '/api/dispositions'));
router.use('/api/notifications', proxy(NOTIFICATION_URL, '/api/notifications'));

module.exports = router;