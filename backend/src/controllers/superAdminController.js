const pool = require('../db');
const { createRestaurantAccount } = require('./authController');

async function listRestaurants(req, res) {
    try {
        const result = await pool.query(
            `SELECT r.id, r.name, r.slug, r.created_at, u.email
             FROM restaurants r
             LEFT JOIN users u ON u.restaurant_id = r.id
             ORDER BY r.created_at DESC, r.id DESC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar restaurantes' });
    }
}

async function createRestaurant(req, res) {
    try {
        const result = await createRestaurantAccount(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('super admin create restaurant error:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao criar restaurante' });
    }
}

module.exports = { listRestaurants, createRestaurant };
