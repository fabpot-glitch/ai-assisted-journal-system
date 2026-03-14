const NodeCache = require('node-cache');
const crypto = require('crypto');

const analysisCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const insightsCache = new NodeCache({ stdTTL: 300,  checkperiod: 60  });

function hashText(text) {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto.createHash('md5').update(normalized).digest('hex');
}

function getCachedAnalysis(text)           { return analysisCache.get(hashText(text)) || null; }
function setCachedAnalysis(text, result)   { analysisCache.set(hashText(text), result); }
function getCachedInsights(userId)         { return insightsCache.get(`insights:${userId}`) || null; }
function setCachedInsights(userId, result) { insightsCache.set(`insights:${userId}`, result); }
function invalidateInsights(userId)        { insightsCache.del(`insights:${userId}`); }
function getCacheStats() {
  return { analysis: analysisCache.getStats(), insights: insightsCache.getStats() };
}

module.exports = {
  getCachedAnalysis, setCachedAnalysis,
  getCachedInsights, setCachedInsights,
  invalidateInsights, getCacheStats
};