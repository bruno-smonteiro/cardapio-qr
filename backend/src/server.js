require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS — allow frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 fallback
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 CardápioQR backend rodando na porta ${PORT}`);
});
