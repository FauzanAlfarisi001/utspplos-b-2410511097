const axios = require('axios');
const DispositionModel = require('../models/disposition.model');
require('dotenv').config();

const COMPLAINT_URL = process.env.COMPLAINT_SERVICE_URL;

module.exports = {
    async index(req, res) {
        // page 10 data per page
        const page = parseInt(req.query.page || 1);
        const perPage = parseInt(req.query.per_page|| 10);

        // filter
        const filters = {complaint_id: req.query.complaint_id,status: req.query.status, to_unit_id: req.query.to_unit_id,};
        try {
            const result = await DispositionModel.findAll(filters, page, perPage);
            res.json({ statusCode: 200, meta: { page, per_page: perPage, total: result.total, total_pages: Math.ceil(result.total/perPage) }, data: result.data });
        } catch (e) { 
            res.status(500).json({ message: e.message }); 
        }
    },

    // data disposissi
    async show(req, res) {
        try {
            const d = await DispositionModel.findById(req.params.id);

            if (!d) 
                return res.status(404).json({ message: 'Disposisi tidak ada.' });

            const followups = await DispositionModel.getFollowups(d.id);

            res.json({ statusCode: 200, data: { ...d, followups } });
        } catch (e) { 
            res.status(500).json({ message: e.message }); 
        }
    },

    // create disposisi 
    async create(req, res) {
        const {complaint_id, to_unit_id, note, deadline, assigned_to} = req.body;

        if (!complaint_id || !to_unit_id)
            return res.status(422).json({ message: 'complaint_id dan to_unit_id harus diisi.' });

        try {
            // pengecekan komplen
            const complaintResp = await axios.get(`${COMPLAINT_URL}/api/complaints/internal/${complaint_id}`, {
                headers: {Authorization: req.headers.authorization },
            }).catch(() => null);

            if (!complaintResp || complaintResp.status !== 200)
                return res.status(404).json({ message: 'Pengaduan tidak ditemukan di complaint service.' });

            if (deadline && isNaN(Date.parse(deadline)))
                return res.status(422).json({ message: 'Format deadline yang kamu input tidak valid, tulis deadline dalam formal tanggal ISO 8601.'});

            // simpan db
            const id = await DispositionModel.create({
                complaint_id, to_unit_id, assigned_by: req.user.id, assigned_to, note, deadline,
            });

            await axios.put(`${COMPLAINT_URL}/api/complaints/${complaint_id}/status`, {
                status: 'in_review', changed_by: req.user.id, note: 'Pengaduan didisposisikan.',
            }, 
            { headers: { Authorization: req.headers.authorization } }).catch(() =>{});

            res.status(201).json({ statusCode: 201, message: 'Disposisi sudah dibuat.', id });

        } catch (e) { 
            res.status(500).json({ message: e.message }); 
        }
    },

    async updateStatus(req, res) {
        const { status, message } = req.body;
        const allowed = ['pending','accepted','rejected','completed'];

        if (!status || !allowed.includes(status))
            return res.status(422).json({message: 'Status tidak sesuai.' });

        try {
            const d = await DispositionModel.findById(req.params.id);
            if (!d) return res.status(404).json({ message: 'Disposisi tidak ada.' });
            await DispositionModel.updateStatus(req.params.id, status, req.user.id, message);

            if (status === 'completed') {
                await axios.put(`${COMPLAINT_URL}/api/complaints/${d.complaint_id}/status`, {
                status: 'in_progress', changed_by: req.user.id, note: 'Disposisi selesai.',
                }, { headers: { Authorization: req.headers.authorization } }).catch(() => {});
            }

            res.json({ statusCode: 200, message: 'Status disposisi diupdate.' });
        } catch (e) { 
            res.status(500).json({ message: e.message}); 
        }
    },

    async remove(req, res) {
        try {
            const d = await DispositionModel.findById(req.params.id);

            if (!d) 
                return res.status(404).json({ message: 'Disposisi tidak ada.' });

            // req diterima, dan tidak ada data yang dikembalikan jadinya 204
            await DispositionModel.delete(req.params.id);
            return res.status(204).send(); 

        } catch (e) { res.status(500).json({message: e.message }); }
    },
};