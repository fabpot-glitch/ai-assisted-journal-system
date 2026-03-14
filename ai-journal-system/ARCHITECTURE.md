# ARCHITECTURE.md — AI-Assisted Journal System

## 1. How would you scale this to 100,000 users?
- Migrate SQLite to PostgreSQL with read replicas
- Deploy backend as stateless containers on Kubernetes
- Use BullMQ/SQS queue for async LLM analysis
- Move in-memory cache to Redis shared across instances
- Serve frontend via CDN (CloudFront/Vercel Edge)

## 2. How would you reduce LLM cost?
- Use Claude Haiku (cheapest model) — already implemented
- Cache identical text with MD5 hash — already implemented
- Keep prompts under 200 tokens — already implemented
- Analyze on-demand only, not on every save — already implemented
- Use Anthropic prompt caching for system prompt

## 3. How would you cache repeated analysis?
- Current: node-cache with MD5(normalized text) key, 1hr TTL
- Production: Redis with same MD5 key strategy across instances
- Add similarity cache using text embeddings

## 4. How would you protect sensitive journal data?
- Encrypt journal text with AES-256-GCM at application layer
- Per-user encryption keys via AWS KMS
- Replace userId with JWT-authenticated sessions
- Row-level security in PostgreSQL
- Never log journal text, only log entry IDs
- Strip PII before sending to LLM API

## Bonus Features Implemented
- Streaming LLM response via SSE
- Analysis caching with cached flag in response
- Rate limiting on all endpoints
- Docker and nginx setup
- Cache stats endpoint