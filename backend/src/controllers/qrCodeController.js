const QRCode = require('qrcode');
const pool = require('../db');

async function getQRCode(req, res) {
    try {
        const result = await pool.query(
            'SELECT slug FROM restaurants WHERE id = $1',
            [req.user.restaurantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Restaurante não encontrado' });
        }

        const { slug } = result.rows[0];
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const url = `${frontendUrl}/menu/${slug}`;

        const qrCode = await QRCode.toDataURL(url);

        res.json({ qrCode, url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
}

module.exports = { getQRCode };