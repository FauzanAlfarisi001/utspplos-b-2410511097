const RatingModel = require('../models/rating.model');
module.exports = {

    // tambah rating
    async create(req, res) {
        const body = req.body;

        if (!body) 
            return res.status(400).json({ message: 'Req body kosong.'});

        const { complaint_id, score, feedback} = body;

        if (!complaint_id) 
            return res.status(422).json({ message: 'complaint_id belum diisi.'});

        const scoreInt = parseInt(score);

        if (isNaN(scoreInt) || scoreInt < 1 || scoreInt > 5)
            return res.status(422).json({ message: 'Rating/score harus angka 1-5.'});

        // body kosong
        if (!complaint_id || !score || score < 1 || score > 5)
            return res.status(422).json({ message: 'complaint_id dan rating dengan angka 1-5 harus diisi.' });

        const existing = await RatingModel.findByComplaint(complaint_id);

        if (existing) 
            return res.status(409).json({ message: 'Anda sudah merating, tidak bisa merating lagi.' });

        const id = await RatingModel.create({complaint_id, user_id: req.user.id, score, feedback});
        res.status(201).json({statusCode:201, message:'Kamu berhasil merating.', id });
    },

    // get
    async show(req, res) {
        const r = await RatingModel.findByComplaint(req.params.complaintId);

        if (!r) 
            return res.status(404).json({ message: 'Rating tidak ada.' });

        res.json({ statusCode:200, data:r });
    },

    // get rata2
    async stats(_req, res) {
        const s = await RatingModel.getStats();
        res.json({ statusCode:200, data:{ avg_score: parseFloat(s.avg_score||0).toFixed(2), total:s.total } });
    },
};