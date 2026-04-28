const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const oauthCtrl = require('../controllers/oauth.controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);

router.get('/github', oauthCtrl.githubRedirect);
router.get('/github/callback', oauthCtrl.githubCallback);

module.exports = router;