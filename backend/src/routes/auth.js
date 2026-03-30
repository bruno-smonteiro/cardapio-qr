const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const { registerRestaurant, login, me, logout } = require('../controllers/authController');

const router = express.Router();

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.' },
});

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

router.post('/register', registerLimiter, auth, requireSuperAdmin, registerRestaurant);
router.post('/login', loginLimiter, login);
router.get('/me', auth, me);
router.post('/logout', auth, logout);

module.exports = router;
