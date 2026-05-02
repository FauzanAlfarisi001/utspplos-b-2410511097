const axios = require('axios');
require('dotenv').config();

// endpoint publik gak pakai jwt
const PUBLIC_PATHS = [
    { method: 'POST', path: '/api/auth/login'},
    { method: 'POST', path: '/api/auth/register'},
    { method: 'POST', path: '/api/auth/refresh'},
    { method: 'GET', path: '/api/auth/github'},
    { method: 'GET', path: '/api/auth/github/callback'},
    { method: 'GET', path: '/health'}
];

// filter req yg publik biar gk jwt
function isPublic(method, url) {
    return PUBLIC_PATHS.some(p =>p.method === method && url.startsWith(p.path));
}

module.exports = async function jwtValidation(req, res, next) {
    if (isPublic(req.method, req.originalUrl)) 
        return next();

    // ambil token dari header
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Token tidak diberikan.' });

    try {
        // cek token ke auth, kalau valid auth kasih data user
        const { data } = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`,{ headers:{Authorization: header}});

        // catat data user
        req.headers['x-user-id'] = String(data.user.id);
        req.headers['x-user-role'] = data.user.role;
        req.headers['x-user-email'] = data.user.email;
        next();
    } catch (err) {
        const status = err.response?.status||401;
        return res.status(status).json({ message: 'Token tidak sesuai atau sudah kadaluarsa.'});
    }
};