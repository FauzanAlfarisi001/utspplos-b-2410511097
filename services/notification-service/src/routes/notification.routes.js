const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const nCtrl = require('../controllers/notification.controller');
const rCtrl = require('../controllers/rating.controller');

router.use(auth);

router.get('/', nCtrl.index);
router.patch('/:id/read', nCtrl.markRead);
router.patch('/read-all', nCtrl.markAllRead);

// rating
router.post('/ratings', rCtrl.create);
router.get('/ratings/stats', rCtrl.stats);
router.get('/ratings/complaint/:complaintId', rCtrl.show);

// internal tambah
router.post('/internal/create', nCtrl.internalCreate);

module.exports = router;