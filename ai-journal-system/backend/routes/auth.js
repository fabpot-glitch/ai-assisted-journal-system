const express = require('express');
const router = express.Router();
const { getDB } = require('../db/database');

// POST /api/auth/register
router.post('/register', async (req, res) => {
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
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

// GET /api/auth/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const db = getDB();
    const user = db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;