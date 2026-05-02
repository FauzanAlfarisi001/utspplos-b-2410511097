require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());

app.use(express.json());

app.use('/api/dispositions', require('./routes/disposition.routes'));

app.get('/health', (req, res) => {
    if (req.query.fail === 'true') {
        return res.status(500).json({
            status: 'error',
            service: 'gateway'
        });
    }

    res.json({
        status: 'ok',
        service: 'disposition-service'
    });
});

app.use((_req, res) => res.status(404).json({message: 'Endpoint tidak ada.'}));

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({message: 'Internal server error.'});
});

app.listen(PORT, () => console.log(`Disposition service berjalan di port ${PORT}`));