const pool = require('../db');
const QRCode = require('qrcode');

async function getDashboard(req, res) {
    try {
        const [restResult, catResult, prodResult] = await Promise.all([
            pool.query('SELECT * FROM restaurants WHERE id = $1', [req.user.restaurantId]),
            pool.query('SELECT COUNT(*) FROM categories WHERE restaurant_id = $1', [req.user.restaurantId]),
            pool.query('SELECT COUNT(*) FROM products WHERE restaurant_id = $1', [req.user.restaurantId]),
        ]);

        const restaurant = restResult.rows[0];
        const menuUrl = `${process.env.FRONTEND_URL}/menu/${restaurant.slug}`;
        const qrCode = await QRCode.toDataURL(menuUrl);

        res.json({
            restaurant,
            categoriesCount: parseInt(catResult.rows[0].count),
            productsCount: parseInt(prodResult.rows[0].count),
            menuUrl,
            qrCode,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dashboard' });
    }
}

async function updateRestaurant(req, res) {
    const { name, logo_url, theme_color } = req.body;
    try {
        const result = await pool.query(
            `UPDATE restaurants SET
        name = COALESCE($1, name),
        logo_url = COALESCE($2, logo_url),
        theme_color = COALESCE($3, theme_color)
       WHERE id = $4 RETURNING *`,
            [name, logo_url, theme_color, req.user.restaurantId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar restaurante' });
    }
}

module.exports = { getDashboard, updateRestaurant };
