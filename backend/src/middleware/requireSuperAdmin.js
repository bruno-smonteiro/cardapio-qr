const { SUPER_ADMIN_ROLE } = require('../controllers/authController');

module.exports = function requireSuperAdmin(req, res, next) {
    if (req.user?.role !== SUPER_ADMIN_ROLE) {
        return res.status(403).json({ error: 'Acesso restrito ao super admin' });
    }

    next();
};
