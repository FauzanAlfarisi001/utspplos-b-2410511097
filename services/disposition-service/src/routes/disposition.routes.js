const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/disposition.controller');
const unitCtrl = require('../controllers/unit.controller');

router.use(auth);

router.get('/units', unitCtrl.index);
router.post('/units', unitCtrl.create);

router.get('/', ctrl.index);
router.get('/:id', ctrl.show);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;