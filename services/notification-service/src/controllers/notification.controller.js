const NotificationModel = require('../models/notification.model');
module.exports = {
    async index(req, res) {
        // paginationnya
        const page = parseInt(req.query.page || 1);
        const perPage = parseInt(req.query.per_page|| 3);
        const result = await NotificationModel.findByUser(req.user.id, page, perPage);
        res.json({ statusCode:200, meta:{ page, per_page:perPage, total:result.total, total_pages:Math.ceil(result.total/perPage)}, data:result.data});
    },
    
    // message
    async markRead(req, res) {
        await NotificationModel.markRead(req.params.id, req.user.id);
        res.json({ message: 'Notifikasi sudah dibaca.'});
    },

    async markAllRead(req, res) {
        await NotificationModel.markAllRead(req.user.id);
        res.json({ message: 'Semua notifikasi dibaca.'});
    },

    // internal dipanggil serv lain, tambah notif
    async internalCreate(req, res) {
        const id = await NotificationModel.create(req.body);
        res.status(201).json({ id });
    },
};