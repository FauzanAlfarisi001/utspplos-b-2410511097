require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/notifications', require('./routes/notification.routes'));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service'}));

app.listen(PORT, () => console.log(`Notification service berjalan di port ${PORT}`));