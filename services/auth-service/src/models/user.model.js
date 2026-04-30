const db = require('../config/database');

const UserModel = {
    async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await db.query('SELECT id,username,email,full_name,avatar_url,role,oauth_provider,created_at FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    },

    async create(data) {
        const [result] = await db.query(
            'INSERT INTO users (username,email,password,full_name,role,oauth_provider,oauth_id,avatar_url) VALUES (?,?,?,?,?,?,?,?)',
            [data.username, data.email, data.password, data.full_name, data.role||'mahasiswa', data.oauth_provider||null, data.oauth_id||null, data.avatar_url||null]
        );
        return result.insertId;
    },
    async findByOAuth(provider, oauthId) {
        const [rows] = await db.query('SELECT * FROM users WHERE oauth_provider=? AND oauth_id=?', [provider, oauthId]);
        return rows[0] || null;
    },
};

module.exports = UserModel;