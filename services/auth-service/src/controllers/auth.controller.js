const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const jwtConfig = require('../config/jwt');
const UserModel = require('../models/user.model');
const TokenModel = require('../models/token.model');

function generateAccessToken(user) {
    const jti = uuidv4();

    return jwt.sign(
        { jti, sub: user.id, email: user.email, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn }
    );
}

function generateRefreshToken(userId) {
    return jwt.sign({ sub: userId }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
}

const AuthController = {
    async register(req, res) {
        try {
            const body = req.body;
            
            if (!body || typeof body !== 'object')
                return res.status(400).json({ message: 'Req body tidak sesuai.' });

            const { username, email, password, full_name } = body;
            
            if (!username || !email || !password || !full_name)
                return res.status(422).json({ message: 'Semua data wajib diisi.' });

            const existing = await UserModel.findByEmail(email);

            if (existing) 
                return res.status(409).json({ message: 'Email sudah terdaftar.' });

            const hashed = await bcrypt.hash(password, 10);
            const id = await UserModel.create({ username, email, password: hashed, full_name });
            
            return res.status(201).json({ message: 'Registrasi berhasil.', user_id: id });
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error.', error: err.message });
        }
    },

    async login(req, res) {
        try {
            const body = req.body;

            if (!body || typeof body !== 'object')
                return res.status(400).json({ message: 'Req body tidak sesuai.' });

            const { email, password } = body;
            
            if (!email || !password)
                return res.status(422).json({ message: 'Tolong isi email dan passwordnya.' });

            const user = await UserModel.findByEmail(email);

            if (!user || !user.password)
                return res.status(401).json({ message: 'Email atau password yang kamu masukkan salah.' });

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) 
                return res.status(401).json({ message: 'Email atau password yang kamu masukkan salah.' });

            const accessToken  = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user.id);

            // Token expirednya 7 hari
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await TokenModel.saveRefreshToken(user.id, refreshToken, expiresAt);

            return res.json({
                message: 'Login berhasil.',
                access_token: accessToken,
                refresh_token: refreshToken,
                user: { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name },
            });
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error.', error: err.message });
        }
    },

    async refresh(req, res) {
        try {
            const body = req.body;
            
            if (!body || typeof body !== 'object')
                return res.status(400).json({ message: 'Req body tidak sesuai.' });

            const { refresh_token } = body;

            if (!refresh_token) 
                return res.status(422).json({ message: 'Refresh token harus ada.' });

            const stored = await TokenModel.findRefreshToken(refresh_token);

            if (!stored) 
                return res.status(401).json({ message: 'Refresh token tidak sesuai atau sudah kadaluarsa.' });

            let payload;
            try {
                payload = jwt.verify(refresh_token, jwtConfig.refreshSecret);
            } catch {
                return res.status(401).json({ message: 'Refresh token tidak sesuai.' });
            }

            const user = await UserModel.findById(payload.sub);
            
            if (!user) 
                return res.status(404).json({ message: 'User tidak ada/tidak ditemukan.' });

            await TokenModel.revokeRefreshToken(refresh_token);
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user.id);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await TokenModel.saveRefreshToken(user.id, newRefreshToken, expiresAt);

            return res.json({ access_token: newAccessToken, refresh_token: newRefreshToken});
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error.', error: err.message});
        }
    },

    async logout(req, res) {
        try {
            const body = req.body;
            
            if (!body || typeof body !== 'object')
                return res.status(400).json({ message: 'Req body tidak sesuai.' });

            const { refresh_token } = body;
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];

                try {
                    const decoded = jwt.verify(token, jwtConfig.secret);
                    const exp = new Date(decoded.exp * 1000);
                    await TokenModel.blacklistJTI(decoded.jti, exp);
                } catch { /* token expired, kosong/abaikan */ }
            }
            
            if (refresh_token) 
                await TokenModel.revokeRefreshToken(refresh_token);

            return res.json({ message: 'Berhasil logout.' });
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error.', error: err.message });
        }
    },

    async me(req, res) {
        return res.json({ user: req.user });
    },
};

module.exports = AuthController;