-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL,
  normalized_url VARCHAR(2048) NOT NULL UNIQUE,
  short_code VARCHAR(32) UNIQUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITHOUT TIME ZONE,
  expires_at TIMESTAMP WITHOUT TIME ZONE,
  password_hash VARCHAR(255),
  is_password_protected BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_normalized_url ON urls(normalized_url);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at);
CREATE INDEX IF NOT EXISTS idx_urls_expires_at ON urls(expires_at);
