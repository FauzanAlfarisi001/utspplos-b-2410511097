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

router.get('/verify', authenticate, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            role: req.user.role,
        }
    });
});

module.exports = router;