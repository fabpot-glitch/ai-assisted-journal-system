const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'journal.db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ entries: [], users: [], nextId: 1, nextUserId: 1 }, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!data.users) data.users = [];
  if (!data.nextUserId) data.nextUserId = 1;
  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function initializeDB() {
  readDB();
  console.log('✅ AI-Assisted Journal System — Database initialized');
}

function getDB() {
  return {
    // ─── USER AUTH ───────────────────────────────────────────────
    registerUser(username, password, displayName) {
      const db = readDB();
      if (db.users.find(u => u.username === username)) {
        throw new Error('Username already exists.');
      }
      const user = {
        id: `user_${db.nextUserId++}`,
        username,
        password, // plain text for simplicity (no bcrypt dependency)
        displayName: displayName || username,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDB(db);
      return { id: user.id, username: user.username, displayName: user.displayName };
    },

    loginUser(username, password) {
      const db = readDB();
      const user = db.users.find(u => u.username === username && u.password === password);
      if (!user) throw new Error('Invalid username or password.');
      return { id: user.id, username: user.username, displayName: user.displayName };
    },

    getUserById(userId) {
      const db = readDB();
      const user = db.users.find(u => u.id === userId);
      if (!user) return null;
      return { id: user.id, username: user.username, displayName: user.displayName };
    },

    // ─── ENTRIES ─────────────────────────────────────────────────
    insertEntry(userId, ambience, text) {
      const db = readDB();
      const entry = {
        id: db.nextId++,
        userId,
        ambience,
        text,
        emotion: null,
        keywords: [],
        summary: null,
        analyzed: 0,
        createdAt: new Date().toISOString()
      };
      db.entries.push(entry);
      writeDB(db);
      return entry;
    },

    getEntriesByUser(userId) {
      const db = readDB();
      return db.entries
        .filter(e => e.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getEntryById(id) {
      const db = readDB();
      return db.entries.find(e => e.id === Number(id)) || null;
    },

    updateEntryAnalysis(id, emotion, keywords, summary) {
      const db = readDB();
      const entry = db.entries.find(e => e.id === Number(id));
      if (entry) {
        entry.emotion = emotion;
        entry.keywords = keywords;
        entry.summary = summary;
        entry.analyzed = 1;
        writeDB(db);
      }
      return entry;
    },

    deleteEntry(id) {
      const db = readDB();
      db.entries = db.entries.filter(e => e.id !== Number(id));
      writeDB(db);
    },

    // ─── INSIGHTS ────────────────────────────────────────────────
    getInsights(userId) {
      const db = readDB();
      const userEntries = db.entries.filter(e => e.userId === userId);
      const totalEntries = userEntries.length;

      // Top emotion
      const emotionCount = {};
      userEntries.forEach(e => {
        if (e.emotion) emotionCount[e.emotion] = (emotionCount[e.emotion] || 0) + 1;
      });
      const topEmotion = Object.keys(emotionCount).sort((a, b) => emotionCount[b] - emotionCount[a])[0] || null;

      // Most used ambience
      const ambienceCount = {};
      userEntries.forEach(e => {
        ambienceCount[e.ambience] = (ambienceCount[e.ambience] || 0) + 1;
      });
      const mostUsedAmbience = Object.keys(ambienceCount).sort((a, b) => ambienceCount[b] - ambienceCount[a])[0] || null;

      // Recent keywords from last 5 entries
      const recentKeywords = [
        ...new Set(userEntries.slice(0, 5).flatMap(e => e.keywords || []))
      ].slice(0, 8);

      // Emotion history for chart (last 14 entries)
      const emotionHistory = userEntries
        .slice(0, 14)
        .reverse()
        .map(e => ({ date: e.createdAt.split('T')[0], emotion: e.emotion, ambience: e.ambience }));

      // Writing streak
      const streak = calcStreak(userEntries);

      // Emotion distribution
      const emotionDistribution = emotionCount;

      // Ambience distribution
      const ambienceDistribution = ambienceCount;

      return {
        totalEntries, topEmotion, mostUsedAmbience, recentKeywords,
        emotionHistory, streak, emotionDistribution, ambienceDistribution
      };
    }
  };
}

function calcStreak(entries) {
  if (!entries.length) return 0;
  const days = [...new Set(entries.map(e => e.createdAt.split('T')[0]))].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split('T')[0];
  if (days[0] !== today && days[0] !== yesterday()) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

module.exports = { getDB, initializeDB };