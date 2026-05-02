const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const TokenModel = require('../models/token.model');
const UserModel = require('../models/user.model');

module.exports = async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
        return res.status(401).json({ message: 'Token tidak ada.' });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        const blacklisted = await TokenModel.isBlacklisted(decoded.jti);
        if (blacklisted) return res.status(401).json({ message: 'Token sudah tidak valid (logout).' });

        req.user = await UserModel.findById(decoded.sub);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak sesuai atau sudah kadaluarsa. Silahkan login ulang' });
    }
};