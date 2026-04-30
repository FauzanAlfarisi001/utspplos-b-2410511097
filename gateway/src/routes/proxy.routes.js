const {createProxyMiddleware} = require('http-proxy-middleware');
const router = require('express').Router();
const requireRole = require('../middlewares/roleGuard.middleware');
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

// admin
router.delete('/api/complaints/:id',requireRole('admin'), proxy(COMPLAINT_URL));
router.post('/api/dispositions/units', requireRole('admin'), proxy(DISPOSITION_URL));

// admin dan staff
router.post('/api/categories',requireRole('admin', 'staff'),proxy(COMPLAINT_URL));
router.post('/api/dispositions', requireRole('admin', 'staff'), proxy(DISPOSITION_URL));

router.use('/api/complaints', proxy(COMPLAINT_URL));
router.use('/api/categories', proxy(COMPLAINT_URL));

router.use('/api/dispositions', proxy(DISPOSITION_URL));
router.use('/api/notifications', proxy(NOTIFICATION_URL));

module.exports = router;