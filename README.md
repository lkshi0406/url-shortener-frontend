# URL Shortener - Modern & Secure

A production-ready URL shortener built with React + Vite (Frontend) and Node.js + Express + PostgreSQL (Backend). Features password protection, QR code generation, TTL support, and a beautiful modern UI.

## Tech Stack

**Frontend:**
- React 19.2.4
- Vite 8.0.1
- QR Code Generation (qrcode.react)

**Backend:**
- Node.js 18+
- Express.js 5.1.0
- PostgreSQL 14+
- Bcrypt (password hashing)
- Helmet (security headers)
- Rate Limiting

## Core Features

✅ URL Shortening with Base62 encoding
✅ Password Protection with bcrypt hashing
✅ QR Code Generation
✅ TTL/Expiration Support
✅ Custom Aliases
✅ URL Deduplication
✅ Click Analytics
✅ Rate Limiting
✅ Security Headers
✅ Responsive Modern UI

## Project Structure

```
url-shortener/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styling
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Global styles
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Frontend dependencies
│   └── eslint.config.js     # Linting config
│
├── backend/
│   ├── src/
│   │   ├── index.js         # App entry point
│   │   ├── app.js           # Express setup
│   │   ├── config/          # Configuration files
│   │   │   ├── db.js        # Database connection
│   │   │   └── env.js       # Environment variables
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database queries
│   │   ├── middlewares/     # Express middleware
│   │   └── utils/           # Utilities
│   ├── db/                  # Database files
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   ├── migrate.js           # Database migrations
│   └── db.js                # Database utilities
│
├── package.json             # Root workspace config
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```

2. **Configure Backend**
   - Copy `.env.example` to `backend/.env` (if not exists)
   - Update PostgreSQL credentials in `backend/.env`
   - Default: `postgres://postgres:chinni@localhost:5432/url_shortener`

3. **Setup Database**
   ```bash
   cd backend
   node migrate.js  # Run migrations
   ```

### Development

**Terminal 1 - Start Backend:**
```bash
npm run backend:dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
npm run frontend:dev
# Frontend runs on http://localhost:5173
```

**Or run both together:**
```bash
npm run dev:all
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## API Endpoints

### Create Short URL
```http
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "customCode": "mycode",     // optional
  "password": "secret123",    // optional
  "ttlSeconds": 86400        // optional (1 day)
}

Response:
{
  "success": true,
  "data": {
    "shortUrl": "http://localhost:5000/abc123",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "isPasswordProtected": true,
    "expiresAt": "2024-04-05T12:00:00Z",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Redirect to Original URL
```http
GET /:shortCode

# If password protected, returns HTML form
# Otherwise, redirects to original URL (302)
```

### Verify Password
```http
POST /:shortCode/verify-password
Content-Type: application/json

{
  "password": "secret123"
}

Response:
{
  "success": true,
  "originalUrl": "https://example.com/very/long/url"
}
```

## Database Schema

```sql
CREATE TABLE urls (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(10) NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  password_hash VARCHAR(255),
  is_password_protected BOOLEAN DEFAULT FALSE,
  ttl_seconds INT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  click_count INT DEFAULT 0
);

CREATE INDEX idx_short_code ON urls(short_code);
CREATE INDEX idx_normalized_url ON urls(normalized_url);
```

## Configuration

### Frontend Environment Variables
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:5000)

### Backend Environment Variables
- `NODE_ENV` - development | production
- `PORT` - Server port (default: 5000)
- `BASE_URL` - Base URL for short links
- `DATABASE_URL` - PostgreSQL connection string
- `REDIRECT_STATUS_CODE` - HTTP status for redirects (302 or 301)

## Testing

### Test Endpoints

1. **Create a protected short URL:**
   - Open http://localhost:5173
   - Enter URL, set password "test123"
   - Submit

2. **Access via React App:**
   - Click "Request Access"
   - Enter password in modal

3. **Access Direct Link:**
   - Copy short URL to new tab
   - Fills HTML form
   - Enter password and unlock

## Scripts

**Root Level:**
- `npm run frontend:dev` - Start frontend dev server
- `npm run backend:dev` - Start backend with file watch
- `npm run frontend:build` - Build frontend for production
- `npm run backend:start` - Run backend server
- `npm run dev:all` - Run both frontend and backend

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start with file watch (using node --watch)
- `npm start` - Start production server

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Helmet.js security headers
- ✅ Rate limiting (300/min global, 30/min per endpoint)
- ✅ Input validation and normalization
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured
- ✅ Custom Content Security Policy for inline scripts
- ✅ HTTP-only environment variables

## Performance

- Deterministic Base62 encoding for consistent short codes
- Database indexes on frequently queried columns
- Click count and analytics tracking
- Normalized URL deduplication

## Future Enhancements (Tier 2)

- Link preview feature
- Custom domain support
- Advanced analytics dashboard
- QR code download
- Link groups/management
- API key authentication
- Email notifications
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
