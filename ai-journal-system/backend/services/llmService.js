const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

function buildPrompt(text) {
  return `Analyze the emotion in the following journal entry and respond ONLY with a JSON object.
The JSON must have exactly these fields:
- "emotion": a single word (e.g. happy, sad, anxious, angry, calm, excited)
- "keywords": an array of 3-5 key words or phrases from the text
- "summary": a one-sentence summary of the entry

Journal entry:
"""
${text}
"""

Respond with ONLY the JSON object, no explanation, no markdown, no code blocks.`;
}

async function analyzeEmotion(text) {
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: buildPrompt(text) }],
    max_tokens: 1024,
  });
  const raw = response.choices[0].message.content.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Groq returned unparseable response');
  }
}

async function* analyzeEmotionStream(text) {
  const stream = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: buildPrompt(text) }],
    max_tokens: 1024,
    stream: true,
  });
  for await (const chunk of stream) {
    const chunkText = chunk.choices[0]?.delta?.content;
    if (chunkText) yield chunkText;
  }
}

module.exports = { analyzeEmotion, analyzeEmotionStream };