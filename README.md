# URL Shortener (Production-Ready Backend)

Scalable URL shortener backend using Node.js + Express + PostgreSQL + Redis, with deterministic Base62 short code generation, caching, security middleware, and a minimal React client for manual testing.

## Tech Stack

- Backend: Node.js 18+, Express.js
- Database: PostgreSQL 14+
- Cache: Redis 7+
- Optional UI: React + Vite

## Core Features

- POST /shorten to create short URLs
- GET /:shortCode to redirect to original URL
- Deterministic Base62 short code generation from auto-increment id
- Redis read-through cache for redirect lookups
- Postgres index on short_code for fast retrieval
- Duplicate URL deduplication (same normalized URL returns existing short code)
- Optional custom aliases
- Optional TTL expiry support
- Basic analytics: click_count + last_accessed_at
- Global and endpoint-level rate limiting

## Project Structure

```text
server/
	db/
		schema.sql
	src/
		config/
			db.js
			env.js
			redis.js
		controllers/
			urlController.js
		middlewares/
			errorHandler.js
			rateLimiter.js
		repositories/
			urlsRepository.js
		routes/
			urlRoutes.js
		services/
			cacheService.js
			urlService.js
		utils/
			base62.js
			errors.js
			url.js
		app.js
		index.js
src/
	App.jsx
	App.css
	index.css
```

## Architecture

Layered architecture:

1. Routes: Endpoint mapping and HTTP wiring.
2. Controllers: Request/response orchestration.
3. Services: Business logic (normalization, Base62 generation, cache flow, redirect behavior).
4. Repository: SQL data access only.

Benefits:

- Clear separation of concerns
- Easy unit/integration testing
- Scalable for additional features (auth, teams, billing, etc.)

## Database Schema

Run SQL from server/db/schema.sql:

```sql
CREATE TABLE IF NOT EXISTS urls (
	id BIGSERIAL PRIMARY KEY,
	original_url TEXT NOT NULL,
	normalized_url TEXT NOT NULL,
	short_code VARCHAR(32) UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	click_count BIGINT NOT NULL DEFAULT 0,
	last_accessed_at TIMESTAMPTZ,
	expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_normalized_url ON urls(normalized_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
```

The short_code index guarantees near O(1) lookup performance under normal indexing assumptions.

## Deterministic Short Code Generation

- Create DB row to obtain id (BIGSERIAL).
- Encode id into Base62.
- Update row short_code using encoded value.

This guarantees deterministic, collision-free mapping without random generation.

## Redis Caching Strategy

Cache key:

- url:{shortCode} -> { id, originalUrl, expiresAt }

Redirect flow:

1. Read Redis first.
2. On hit: redirect and update analytics in DB.
3. On miss: read DB by indexed short_code, cache value, redirect.

This minimizes database load for high read traffic.

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Environment

Copy .env.example to .env and set values:

```bash
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/url_shortner
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=3600
REDIRECT_STATUS_CODE=302
VITE_API_BASE_URL=http://localhost:5000
```

### 3) Create database table

```bash
psql "postgres://postgres:postgres@localhost:5432/url_shortner" -f server/db/schema.sql
```

### 4) Run backend

```bash
npm run dev:server
```

### 5) Run frontend (optional)

```bash
npm run dev
```

## API Endpoints

### Health

- GET /health

Response:

```json
{
	"success": true,
	"message": "Service is healthy."
}
```

### Shorten URL

- POST /shorten

Request body:

```json
{
	"url": "https://example.com/some/path?utm_source=summer",
	"customCode": "launch2026",
	"ttlSeconds": 86400
}
```

All fields except url are optional.

Response:

```json
{
	"success": true,
	"data": {
		"id": 1,
		"originalUrl": "https://example.com/some/path?utm_source=summer",
		"shortCode": "1",
		"shortUrl": "http://localhost:5000/1",
		"createdAt": "2026-04-03T09:25:00.000Z",
		"clickCount": 0,
		"lastAccessedAt": null,
		"expiresAt": null
	}
}
```

### Redirect

- GET /:shortCode

Behavior:

- Returns HTTP 302 redirect by default (configurable via REDIRECT_STATUS_CODE).
- Returns 404 if code does not exist.
- Returns 410 if expired.

## Security and Reliability Decisions

- Helmet for secure HTTP headers
- JSON body size limit to reduce abuse surface
- Global rate limiting + stricter limit on POST /shorten
- URL validation limited to HTTP/HTTPS
- Private/local host blocking (basic SSRF hardening)
- Centralized error handling and safe response messages

## Testing (Postman/curl)

### Create short URL

```bash
curl -X POST http://localhost:5000/shorten \
	-H "Content-Type: application/json" \
	-d '{"url":"https://example.com/docs"}'
```

### Resolve short URL

```bash
curl -i http://localhost:5000/1
```

### Validate cache behavior

1. Hit GET /:shortCode once to warm cache.
2. Check Redis key exists:

```bash
redis-cli GET url:1
```

3. Repeat GET /:shortCode and observe reduced DB dependency.

## NPM Scripts

- npm run dev:server: Run backend with watch mode.
- npm run start:server: Run backend in standard mode.
- npm run dev: Run Vite frontend.
- npm run build: Build frontend assets.
- npm run lint: Lint project files.

## Why These Choices

- PostgreSQL provides transactional safety and mature indexing for reliable mapping.
- Base62(id) keeps codes short, deterministic, and collision-free.
- Redis cache absorbs read-heavy redirect traffic.
- Layered architecture keeps codebase maintainable as the product grows.
