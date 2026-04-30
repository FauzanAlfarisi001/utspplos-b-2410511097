const db = require('../config/database');

// model pemanggilan db notif

const NotificationModel = {
    // get dengan id
    async findByUser(userId, page, perPage) {
        const offset = (page-1)*perPage;
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM notifications WHERE user_id=?',[userId]);
        const [rows] = await db.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?',[userId,perPage,offset]);
        return { data: rows, total };
    },

    // tambah
    async create(data) {
        const [r] = await db.query('INSERT INTO notifications (user_id,complaint_id,type,title,message) VALUES (?,?,?,?,?)',[data.user_id, data.complaint_id||null, data.type, data.title, data.message]);
        return r.insertId;
    },

    // patch isi isread
    async markRead(id, userId) {
        await db.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[id,userId]);
    },

    async markAllRead(userId) {
        await db.query('UPDATE notifications SET is_read=1 WHERE user_id=?',[userId]);
    },
};
module.exports = NotificationModel;