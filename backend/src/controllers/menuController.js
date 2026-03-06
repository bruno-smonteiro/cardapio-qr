const pool = require('../db');

async function getMenu(req, res) {
    const { slug } = req.params;
    try {
        const restResult = await pool.query(
            'SELECT id, name, logo_url, theme_color, slug FROM restaurants WHERE slug = $1',
            [slug]
        );

        if (restResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cardápio não encontrado' });
        }

        const restaurant = restResult.rows[0];

        const categoriesResult = await pool.query(
            'SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY sort_order ASC, id ASC',
            [restaurant.id]
        );

        const productsResult = await pool.query(
            `SELECT * FROM products
       WHERE restaurant_id = $1 AND available = TRUE
       ORDER BY sort_order ASC, id ASC`,
            [restaurant.id]
        );

        // Group products by category
        const categories = categoriesResult.rows.map((cat) => ({
            ...cat,
            products: productsResult.rows.filter((p) => p.category_id === cat.id),
        }));

        // Products without category
        const uncategorized = productsResult.rows.filter((p) => p.category_id === null);

        res.json({ restaurant, categories, uncategorized });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar cardápio' });
    }
}

module.exports = { getMenu };
