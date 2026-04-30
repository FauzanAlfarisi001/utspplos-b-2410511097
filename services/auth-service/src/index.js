require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((_req, res)=>res.status(404).json({message: 'Endpoint tidak ditemukan.'}));

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
});

app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.listen(PORT, () => console.log(`Auth service berjalan di port ${PORT}`));