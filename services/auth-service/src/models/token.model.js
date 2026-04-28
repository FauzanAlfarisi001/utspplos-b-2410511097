const db = require('../config/database');

const TokenModel = {
    async saveRefreshToken(userId, token, expiresAt) {
        await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?,?,?)', [userId, token, expiresAt]);
    },

    async findRefreshToken(token) {
        const [rows] = await db.query('SELECT * FROM refresh_tokens WHERE token=? AND is_revoked=0 AND expires_at > NOW()', [token]);
        return rows[0] || null;
    },
    
    async revokeRefreshToken(token) {
        await db.query('UPDATE refresh_tokens SET is_revoked=1 WHERE token=?', [token]);
    },
    async blacklistJTI(jti, expiresAt) {
        await db.query('INSERT IGNORE INTO token_blacklist (token_jti, expires_at) VALUES (?,?)', [jti, expiresAt]);
    },
    async isBlacklisted(jti) {
        const [rows] = await db.query('SELECT id FROM token_blacklist WHERE token_jti=?', [jti]);
        return rows.length > 0;
    },
};

module.exports = TokenModel;