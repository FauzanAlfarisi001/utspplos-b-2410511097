const axios = require('axios');
require('dotenv').config();

module.exports = async function authenticate(req, res, next) {
    const header = req.headers.authorization;

    // disposisi verifikasi token
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Token tidak ada.' });

    try {
        // cek ke auth
        const { data } = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`, {headers: { Authorization: header },});
        req.user = data.user;
        next();
    } catch {
        return res.status(401).json({message: 'Token tidak sesuai.' });
    }
};