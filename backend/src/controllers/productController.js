const pool = require('../db');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'cardapioqr/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
    },
});

const upload = multer({ storage });

async function listProducts(req, res) {
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.restaurant_id = $1
       ORDER BY p.sort_order ASC, p.id ASC`,
            [req.user.restaurantId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
}

async function createProduct(req, res) {
    const { category_id, name, description, price, sort_order = 0 } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Nome e preço são obrigatórios' });

    const image_url = req.file ? req.file.path : null;

    try {
        const result = await pool.query(
            `INSERT INTO products (restaurant_id, category_id, name, description, price, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.restaurantId, category_id || null, name, description || null, price, image_url, sort_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
}

async function updateProduct(req, res) {
    const { id } = req.params;
    const { category_id, name, description, price, available, sort_order } = req.body;
    const image_url = req.file ? req.file.path : undefined;

    const fields = [];
    const values = [];
    let index = 1;

    if (name !== undefined) { fields.push(`name = $${index++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${index++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${index++}`); values.push(price); }
    if (available !== undefined) { fields.push(`available = $${index++}`); values.push(available); }
    if (sort_order !== undefined) { fields.push(`sort_order = $${index++}`); values.push(sort_order); }
    if (category_id !== undefined) { fields.push(`category_id = $${index++}`); values.push(category_id); }
    if (image_url !== undefined) { fields.push(`image_url = $${index++}`); values.push(image_url); }

    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(id, req.user.restaurantId);

    try {
        const result = await pool.query(
            `UPDATE products SET ${fields.join(', ')}
       WHERE id = $${index++} AND restaurant_id = $${index} RETURNING *`,
            values
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
}

async function deleteProduct(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND restaurant_id = $2 RETURNING id',
            [id, req.user.restaurantId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto removido' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct, upload };
