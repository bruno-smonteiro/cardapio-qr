const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    const bearerHeader = req.headers.authorization;
    const bearerToken = bearerHeader?.startsWith('Bearer ')
        ? bearerHeader.split(' ')[1]
        : null;
    const token = bearerToken || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Autenticacao obrigatoria' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Sessao invalida ou expirada' });
    }
};
