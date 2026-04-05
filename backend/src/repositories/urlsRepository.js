import { dbPool } from '../config/db.js';

export const urlsRepository = {
  async findByNormalizedUrl(normalizedUrl) {
    const result = await dbPool.query(
      `SELECT id, original_url, normalized_url, short_code, created_at, click_count, last_accessed_at, expires_at, password_hash, is_password_protected
       FROM urls
       WHERE normalized_url = $1`,
      [normalizedUrl],
    );

    return result.rows[0] ?? null;
  },

  async findByShortCode(shortCode) {
    const result = await dbPool.query(
      `SELECT id, original_url, normalized_url, short_code, created_at, click_count, last_accessed_at, expires_at, password_hash, is_password_protected
       FROM urls
       WHERE short_code = $1`,
      [shortCode],
    );

    return result.rows[0] ?? null;
  },

  async createWithCustomCode({ originalUrl, normalizedUrl, shortCode, expiresAt, passwordHash, isPasswordProtected }) {
    const result = await dbPool.query(
      `INSERT INTO urls (original_url, normalized_url, short_code, expires_at, password_hash, is_password_protected)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, original_url, normalized_url, short_code, created_at, click_count, last_accessed_at, expires_at, is_password_protected`,
      [originalUrl, normalizedUrl, shortCode, expiresAt, passwordHash, isPasswordProtected],
    );

    return result.rows[0];
  },

  async createPending({ originalUrl, normalizedUrl, shortCode, expiresAt, passwordHash, isPasswordProtected }) {
    const result = await dbPool.query(
      `INSERT INTO urls (original_url, normalized_url, short_code, expires_at, password_hash, is_password_protected)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, original_url, normalized_url, short_code, created_at, expires_at, password_hash, is_password_protected`,
      [originalUrl, normalizedUrl, shortCode, expiresAt, passwordHash, isPasswordProtected],
    );

    return result.rows[0];
  },

  async updateShortCode({ id, shortCode }) {
    const result = await dbPool.query(
      `UPDATE urls
       SET short_code = $1
       WHERE id = $2
       RETURNING id, original_url, normalized_url, short_code, created_at, click_count, last_accessed_at, expires_at, password_hash, is_password_protected`,
      [shortCode, id],
    );

    return result.rows[0] ?? null;
  },

  async incrementClicks(id) {
    await dbPool.query(
      `UPDATE urls
       SET click_count = click_count + 1,
           last_accessed_at = NOW()
       WHERE id = $1`,
      [id],
    );
  },
};
