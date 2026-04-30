const db = require('../config/database');

// model syntax/kode mysql rating
const RatingModel = {
    // get
    async findByComplaint(complaintId) {
        const [r] = await db.query('SELECT * FROM ratings WHERE complaint_id=?',[complaintId]);
        return r[0]||null;
    },

    // tambah
    async create(data) {
        const [r] = await db.query('INSERT INTO ratings (complaint_id,user_id,score,feedback) VALUES (?,?,?,?)',[data.complaint_id, data.user_id, data.score, data.feedback||null]);
        return r.insertId;
    },

    // rata2 rating
    async getStats() {
        const [[r]] = await db.query('SELECT AVG(score) as avg_score, COUNT(*) as total FROM ratings');
        return r;
    },
};

module.exports = RatingModel;