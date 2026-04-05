import { urlsRepository } from '../repositories/urlsRepository.js';
import { HttpError } from '../utils/errors.js';
import { isPotentiallyUnsafeHost, isValidHttpUrl, normalizeUrl } from '../utils/url.js';
import { passwordService } from './passwordService.js';
import { nanoid } from 'nanoid';

const CUSTOM_CODE_PATTERN = /^[a-zA-Z0-9_-]{4,32}$/;

const toResponse = (record, baseUrl) => ({
  originalUrl: record.original_url,
  shortUrl: `${baseUrl.replace(/\/$/, '')}/${record.short_code}`,
  expiresAt: record.expires_at,
  isPasswordProtected: record.is_password_protected ?? false,
});

export const urlService = {
  async createShortUrl({ originalUrl, customCode, ttlSeconds, password, baseUrl }) {
    let normalizedUrl = '';

    try {
      normalizeUrl(originalUrl);
      normalizedUrl = normalizeUrl(originalUrl);
    } catch {
      throw new HttpError(400, 'Invalid URL format.');
    }

    if (!isValidHttpUrl(normalizedUrl)) {
      throw new HttpError(400, 'Only valid HTTP/HTTPS URLs are allowed.');
    }

    if (isPotentiallyUnsafeHost(normalizedUrl)) {
      throw new HttpError(400, 'URLs pointing to local/private hosts are not allowed.');
    }

    const expiresAt =
      Number.isFinite(ttlSeconds) && ttlSeconds > 0
        ? new Date(Date.now() + ttlSeconds * 1000)
        : null;

    // Hash password if provided
    let passwordHash = null;
    let isPasswordProtected = false;
    if (password && password.trim()) {
      if (password.length < 4) {
        throw new HttpError(400, 'Password must be at least 4 characters.');
      }
      passwordHash = await passwordService.hashPassword(password);
      isPasswordProtected = true;
    }

    if (customCode) {
      if (!CUSTOM_CODE_PATTERN.test(customCode)) {
        throw new HttpError(400, 'Custom code must be 4-32 chars and only include letters, numbers, _ or -.');
      }

      const existingByCode = await urlsRepository.findByShortCode(customCode);
      if (existingByCode) {
        throw new HttpError(409, 'Custom short code is already taken.');
      }

      const created = await urlsRepository.createWithCustomCode({
        originalUrl: normalizedUrl,
        normalizedUrl,
        shortCode: customCode,
        expiresAt,
        passwordHash,
        isPasswordProtected,
      });

      return toResponse(created, baseUrl);
    }

    const existingByUrl = await urlsRepository.findByNormalizedUrl(normalizedUrl);
    if (existingByUrl) {
      return toResponse(existingByUrl, baseUrl);
    }

    // Generate a short code using nanoid (6 characters)
    const shortCode = nanoid(6);

    const created = await urlsRepository.createPending({
      originalUrl: normalizedUrl,
      normalizedUrl,
      shortCode,
      expiresAt,
      passwordHash,
      isPasswordProtected,
    });

    return toResponse(created, baseUrl);
  },

  async resolveShortCode(shortCode) {
    const record = await urlsRepository.findByShortCode(shortCode);
    if (!record) {
      throw new HttpError(404, 'Short URL not found.');
    }

    if (record.expires_at && new Date(record.expires_at) <= new Date()) {
      throw new HttpError(410, 'This short URL has expired.');
    }

    // Check if password protected
    if (record.is_password_protected) {
      // Return special response indicating password is needed
      return {
        isPasswordProtected: true,
        originalUrl: null,
        requiresPassword: true,
      };
    }

    await urlsRepository.incrementClicks(record.id);

    return {
      isPasswordProtected: false,
      originalUrl: record.original_url,
      requiresPassword: false,
    };
  },

  async verifyAndResolveShortCode(shortCode, password) {
    const record = await urlsRepository.findByShortCode(shortCode);
    if (!record) {
      throw new HttpError(404, 'Short URL not found.');
    }

    if (record.expires_at && new Date(record.expires_at) <= new Date()) {
      throw new HttpError(410, 'This short URL has expired.');
    }

    // If password protected, verify it
    if (record.is_password_protected) {
      if (!password) {
        throw new HttpError(403, 'Password required.');
      }

      const isValid = await passwordService.verifyPassword(password, record.password_hash);
      if (!isValid) {
        throw new HttpError(403, 'Incorrect password.');
      }
    }

    await urlsRepository.incrementClicks(record.id);

    return record.original_url;
  },
};
