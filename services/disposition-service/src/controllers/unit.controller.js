const UnitModel = require('../models/unit.model');

module.exports = {
    async index(_req, res) { 
        res.json({ data: await UnitModel.findAll() }); 
    },

    async create(req, res) {
        const { name, code } = req.body;

        if (!name || !code) 
            return res.status(422).json({message: 'name dan code harus wajib ada.'});

        const id = await UnitModel.create(req.body);

        res.status(201).json({id});
    },
};