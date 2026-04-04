CREATE TABLE IF NOT EXISTS urls (
  id BIGSERIAL PRIMARY KEY,
  original_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  short_code VARCHAR(32) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  click_count BIGINT NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  password_hash VARCHAR(255),
  is_password_protected BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_normalized_url ON urls(normalized_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
