const db = require('../config/database');

// model pemanggilan database 

const DispositionModel = {
    async findAll(filters, page, perPage) {
        let sql  = `SELECT d.*, u1.name as from_unit_name, u2.name as to_unit_name FROM dispositions d
                    LEFT JOIN units u1 ON d.from_unit_id = u1.id LEFT JOIN units u2 ON d.to_unit_id   = u2.id WHERE 1=1`;
        const params = [];

        if (filters.complaint_id) { 
            sql += ' AND d.complaint_id=?'; 
            params.push(filters.complaint_id); 
        }

        if (filters.status) { 
            sql += ' AND d.status=?'; 
            params.push(filters.status); 
        }

        if (filters.to_unit_id) { 
            sql += ' AND d.to_unit_id=?'; 
            params.push(filters.to_unit_id); 
        }

        sql += ' ORDER BY d.created_at DESC';

        const countSql = sql.replace(/SELECT .+? FROM/, 'SELECT COUNT(*) as total FROM');

        const [[{ total }]] = await db.query(countSql, params);

        sql += ' LIMIT ? OFFSET ?';

        // pakai pagination
        params.push(perPage, (page - 1) * perPage);

        const [rows] = await db.query(sql, params);

        return {data: rows, total};
    },

    async findById(id) {
        const [rows] = await db.query(
        `SELECT d.*, u1.name as from_unit, u2.name as to_unit FROM dispositions d
        LEFT JOIN units u1 ON d.from_unit_id=u1.id LEFT JOIN units u2 ON d.to_unit_id=u2.id WHERE d.id=?`, [id]);
        
        return rows[0]||null;
    },

    // post/tambah
    async create(data) {
        const [r] = await db.query('INSERT INTO dispositions (complaint_id,from_unit_id,to_unit_id,assigned_by,assigned_to,note,deadline) VALUES (?,?,?,?,?,?,?)',[data.complaint_id, data.from_unit_id||null, data.to_unit_id, data.assigned_by, data.assigned_to||null, data.note||null, data.deadline||null]);

        return r.insertId;
    },

    // put
    async updateStatus(id, status, userId, message) {
        await db.query('UPDATE dispositions SET status=?,updated_at=NOW() WHERE id=?', [status, id]);
        if (message) 
            await db.query('INSERT INTO disposition_followups (disposition_id,user_id,message) VALUES (?,?,?)', [id, userId, message]);
    },

    // histori
    async getFollowups(dispositionId) {
        const [rows] = await db.query('SELECT * FROM disposition_followups WHERE disposition_id=? ORDER BY created_at ASC', [dispositionId]);
        
        return rows;
    },
};

module.exports = DispositionModel;