require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use((_req, res) => res.status(404).json({message: 'Endpoint itu tidak ada.'}));

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({message: 'Error dari internal server.'});
});

app.use('/api/notifications', require('./routes/notification.routes'));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service'}));

app.listen(PORT, () => console.log(`Notification service berjalan di port ${PORT}`));