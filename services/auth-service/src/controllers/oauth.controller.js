const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const jwtConfig = require('../config/jwt');
const UserModel = require('../models/user.model');
const TokenModel = require('../models/token.model');
const db = require('../config/database');
require('dotenv').config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

function generateAccessToken(user) {
    const jti = uuidv4();
    return jwt.sign({ jti, sub: user.id, email: user.email, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
}
function generateRefreshToken(userId) {
    return jwt.sign({ sub: userId }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
}

const OAuthController = {
    githubRedirect(req, res) {

        const scope = 'read:user user:email';
        const state = uuidv4();
        const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}&scope=${scope}&state=${state}`;
        res.redirect(url);
    },

    async githubCallback(req, res) {

        const { code } = req.query;
        if (!code) return res.status(400).json({ message: 'Kode oauth tidak ada.' });

        try {
            const tokenResp = await axios.post(
                'https://github.com/login/oauth/access_token',
                { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code, redirect_uri: GITHUB_CALLBACK_URL },
                { headers: { 
                    Accept: 'application/json' 
                } }
            );

            const ghToken = tokenResp.data.access_token;
            if (!ghToken) return res.status(401).json({ message: 'Tidak bisa mendapatkan token dari github.' });

            const [profileResp, emailResp] = await Promise.all([
                axios.get('https://api.github.com/user',{ headers:{Authorization: `Bearer ${ghToken}` }}),
                axios.get('https://api.github.com/user/emails', {headers:{ Authorization: `Bearer ${ghToken}`}}),
            ]);

            const ghUser = profileResp.data;
            const primaryEmail = emailResp.data.find(e => e.primary && e.verified)?.email ||ghUser.email;

            let user = await UserModel.findByOAuth('github', String(ghUser.id));

            if (!user && primaryEmail) 
                user = await UserModel.findByEmail(primaryEmail);

            if (!user) {
                const newId = await UserModel.create({
                username: ghUser.login,
                email: primaryEmail || `${ghUser.id}@githubemail.local`,
                password: null,
                full_name: ghUser.name || ghUser.login,
                role: 'mahasiswa',
                oauth_provider: 'github',
                oauth_id: String(ghUser.id),
                avatar_url: ghUser.avatar_url,
                });
                user = await UserModel.findById(newId);

            } else if (!user.oauth_provider) {
                await db.query('UPDATE users SET oauth_provider=?, oauth_id=?, avatar_url=? WHERE id=?',['github', String(ghUser.id), ghUser.avatar_url, user.id]);

                // refresh
                user = await UserModel.findById(user.id); 
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user.id);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await TokenModel.saveRefreshToken(user.id, refreshToken, expiresAt);

            res.redirect(`${FRONTEND_URL}/oauth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`);

        } catch (err) {
            res.status(500).json({ message: 'Oauth error', error: err.message });
        }
    },
};

module.exports = OAuthController;