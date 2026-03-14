const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');
const { analyzeEmotion, analyzeEmotionStream } = require('../services/llmService');
const {
  getCachedAnalysis, setCachedAnalysis,
  getCachedInsights, setCachedInsights,
  invalidateInsights, getCacheStats
} = require('../services/cacheService');
const { generalLimiter, analyzeLimiter } = require('../middleware/rateLimiter');

router.use(generalLimiter);

// POST /api/journal/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });
    if (username.length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    if (password.length < 4)
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    const db = getDB();
    const user = db.registerUser(username, password, displayName);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/journal/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });
    const db = getDB();
    const user = db.loginUser(username, password);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// GET /api/journal/auth/user/:userId
router.get('/auth/user/:userId', async (req, res) => {
  try {
    const db = getDB();
    const user = db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/journal
router.post('/', async (req, res) => {
  try {
    const { userId, ambience, text } = req.body;
    if (!userId || !ambience || !text)
      return res.status(400).json({ error: 'userId, ambience, and text are required.' });
    if (text.length > 5000)
      return res.status(400).json({ error: 'Text exceeds 5000 character limit.' });
    const db = getDB();
    const entry = db.insertEntry(userId, ambience, text);
    invalidateInsights(userId);
    res.status(201).json({ success: true, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create journal entry.' });
  }
});

// POST /api/journal/analyze
router.post('/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { text, stream } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required.' });

    const cached = getCachedAnalysis(text);
    if (cached) return res.json({ ...cached, cached: true });

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      let fullText = '';
      for await (const chunk of analyzeEmotionStream(text)) {
        fullText += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setCachedAnalysis(text, parsed);
          res.write(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`);
        }
      } catch {}
      return res.end();
    }

    const result = await analyzeEmotion(text);
    setCachedAnalysis(text, result);
    res.json({ ...result, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze text.' });
  }
});

// POST /api/journal/analyze-entry/:entryId
router.post('/analyze-entry/:entryId', analyzeLimiter, async (req, res) => {
  try {
    const { entryId } = req.params;
    const db = getDB();
    const entry = db.getEntryById(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });

    let result = getCachedAnalysis(entry.text);
    const wasCached = !!result;
    if (!result) {
      result = await analyzeEmotion(entry.text);
      setCachedAnalysis(entry.text, result);
    }

    db.updateEntryAnalysis(entryId, result.emotion, result.keywords, result.summary);
    invalidateInsights(entry.userId);
    res.json({ ...result, entryId: Number(entryId), cached: wasCached });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze entry.' });
  }
});

// DELETE /api/journal/:entryId
router.delete('/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const db = getDB();
    const entry = db.getEntryById(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    db.deleteEntry(entryId);
    invalidateInsights(entry.userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

// GET /api/journal/cache/stats
router.get('/cache/stats', (req, res) => res.json(getCacheStats()));

// GET /api/journal/insights/:userId
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cached = getCachedInsights(userId);
    if (cached) return res.json({ ...cached, cached: true });
    const db = getDB();
    const insights = db.getInsights(userId);
    setCachedInsights(userId, insights);
    res.json({ ...insights, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch insights.' });
  }
});

// GET /api/journal/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();
    const entries = db.getEntriesByUser(userId);
    res.json({ entries, total: entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries.' });
  }
});

module.exports = router;