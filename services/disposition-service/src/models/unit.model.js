const db = require('../config/database');

// syntax mysql data unit
const UnitModel = {
    async findAll()  { 
        const [r] = await db.query('SELECT * FROM units WHERE is_active=1'); 
        return r; 
    },
    async findById(id) { 
        const [r] = await db.query('SELECT * FROM units WHERE id=?',[id]); 
        return r[0]|| null; 
    },
    async create(d)  { 
        const [r] = await db.query('INSERT INTO units (name,code,email,pic_user_id) VALUES (?,?,?,?)',[d.name,d.code,d.email ||null,d.pic_user_id||null]); 
        return r.insertId; 
    },
};
module.exports = UnitModel;