const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 12;
const SUPER_ADMIN_ROLE = 'super_admin';
const RESTAURANT_ADMIN_ROLE = 'restaurant_admin';

function generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
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

async function createRestaurantAccount({ restaurantName, slug, email, password }) {
    if (!restaurantName || !slug || !email || !password) {
        const error = new Error('Todos os campos sao obrigatorios');
        error.statusCode = 400;
        throw error;
    }

    const slugClean = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existSlug = await client.query('SELECT id FROM restaurants WHERE slug = $1', [slugClean]);
        if (existSlug.rows.length > 0) {
            const error = new Error('Esse slug ja esta em uso. Escolha outro.');
            error.statusCode = 409;
            throw error;
        }

        const existEmail = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existEmail.rows.length > 0) {
            const error = new Error('E-mail ja cadastrado.');
            error.statusCode = 409;
            throw error;
        }

        const restaurantResult = await client.query(
            'INSERT INTO restaurants (name, slug) VALUES ($1, $2) RETURNING id, name, slug',
            [restaurantName, slugClean]
        );
        const restaurant = restaurantResult.rows[0];

        const passwordHash = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users (restaurant_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
            [restaurant.id, email, passwordHash]
        );
        const user = userResult.rows[0];

        await client.query('COMMIT');

        return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            slug: restaurant.slug,
            userId: user.id,
            email: user.email,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function registerRestaurant(req, res) {
    try {
        const result = await createRestaurantAccount(req.body);
        return res.status(201).json(result);
    } catch (err) {
        console.error('register error:', err);
        return res.status(err.statusCode || 500).json({ error: err.message || 'Erro interno do servidor' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha sao obrigatorios' });
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (superAdminEmail && superAdminPassword && email === superAdminEmail && password === superAdminPassword) {
        const token = generateToken({
            userId: 'super-admin',
            restaurantId: null,
            role: SUPER_ADMIN_ROLE,
            email,
        });
        setAuthCookie(res, token);
        return res.json({ role: SUPER_ADMIN_ROLE, email });
    }

    try {
        const userResult = await pool.query(
            'SELECT u.id, u.password_hash, u.restaurant_id, u.email FROM users u WHERE u.email = $1',
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

        const token = generateToken({
            userId: user.id,
            restaurantId: user.restaurant_id,
            role: RESTAURANT_ADMIN_ROLE,
            email: user.email,
        });
        setAuthCookie(res, token);

        return res.json({
            restaurantId: user.restaurant_id,
            role: RESTAURANT_ADMIN_ROLE,
            email: user.email,
        });
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
        role: req.user.role || RESTAURANT_ADMIN_ROLE,
        email: req.user.email || null,
    });
}

function logout(req, res) {
    res.clearCookie('token', {
        ...getCookieOptions(),
        maxAge: undefined,
    });

    return res.json({ success: true });
}

module.exports = {
    SUPER_ADMIN_ROLE,
    RESTAURANT_ADMIN_ROLE,
    createRestaurantAccount,
    registerRestaurant,
    login,
    me,
    logout,
};
