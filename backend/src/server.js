require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.set('trust proxy', 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin nao permitida pelo CORS'));
    },
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Rota nao encontrada' }));

app.use((err, req, res, next) => {
    if (err.message === 'Origin nao permitida pelo CORS') {
        return res.status(403).json({ error: 'Origem nao autorizada' });
    }

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'A imagem deve ter no maximo 2 MB' });
        }

        return res.status(400).json({ error: 'Upload invalido' });
    }

    if (err.message === 'Tipo de arquivo nao permitido') {
        return res.status(400).json({ error: 'Envie apenas imagens JPG, PNG ou WEBP' });
    }

    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`CardapioQR backend rodando na porta ${PORT}`);
});
