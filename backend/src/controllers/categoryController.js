const pool = require('../db');

async function listCategories(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY sort_order ASC, id ASC',
            [req.user.restaurantId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
}

async function createCategory(req, res) {
    const { name, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    try {
        const result = await pool.query(
            'INSERT INTO categories (restaurant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING *',
            [req.user.restaurantId, name, sort_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
}

async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, sort_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE categories SET
        name = COALESCE($1, name),
        sort_order = COALESCE($2, sort_order)
       WHERE id = $3 AND restaurant_id = $4
       RETURNING *`,
            [name, sort_order, id, req.user.restaurantId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
}

async function deleteCategory(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND restaurant_id = $2 RETURNING id',
            [id, req.user.restaurantId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json({ message: 'Categoria removida' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
