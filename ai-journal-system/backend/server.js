require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db/database');
const journalRoutes = require('./routes/journal');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10kb' }));

initializeDB();

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ AI-Assisted Journal System API running on http://localhost:${PORT}`);
});