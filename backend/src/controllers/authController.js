const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 12;

function generateToken(userId, restaurantId) {
    return jwt.sign(
        { userId, restaurantId },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
    );
}

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
    const secure = sameSite === 'none' ? true : isProduction;

    return {
        httpOnly: true,
        sameSite,
        secure,
        maxAge: TOKEN_MAX_AGE_MS,
        path: '/',
    };
}

function setAuthCookie(res, token) {
    res.cookie('token', token, getCookieOptions());
}

async function register(req, res) {
    const { restaurantName, slug, email, password } = req.body;

    if (!restaurantName || !slug || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
    }

    const slugClean = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existSlug = await client.query('SELECT id FROM restaurants WHERE slug = $1', [slugClean]);
        if (existSlug.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Esse slug ja esta em uso. Escolha outro.' });
        }

        const existEmail = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existEmail.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'E-mail ja cadastrado.' });
        }

        const restaurantResult = await client.query(
            'INSERT INTO restaurants (name, slug) VALUES ($1, $2) RETURNING id',
            [restaurantName, slugClean]
        );
        const restaurantId = restaurantResult.rows[0].id;

        const passwordHash = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users (restaurant_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [restaurantId, email, passwordHash]
        );
        const userId = userResult.rows[0].id;

        await client.query('COMMIT');

        const token = generateToken(userId, restaurantId);
        setAuthCookie(res, token);

        return res.status(201).json({ restaurantId, slug: slugClean });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('register error:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        client.release();
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha sao obrigatorios' });
    }

    try {
        const userResult = await pool.query(
            'SELECT u.id, u.password_hash, u.restaurant_id FROM users u WHERE u.email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais invalidas' });
        }

        const user = userResult.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciais invalidas' });
        }

        const token = generateToken(user.id, user.restaurant_id);
        setAuthCookie(res, token);

        return res.json({ restaurantId: user.restaurant_id });
    } catch (err) {
        console.error('login error:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

function me(req, res) {
    return res.json({
        authenticated: true,
        userId: req.user.userId,
        restaurantId: req.user.restaurantId,
    });
}

function logout(req, res) {
    res.clearCookie('token', {
        ...getCookieOptions(),
        maxAge: undefined,
    });

    return res.json({ success: true });
}

module.exports = { register, login, me, logout };
