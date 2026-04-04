import validator from 'validator';

const { isURL } = validator;
const PRIVATE_HOST_PATTERNS = [/^localhost$/i, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^::1$/i];

export const normalizeUrl = (rawUrl) => {
  const trimmed = String(rawUrl ?? '').trim();

  if (!trimmed) {
    return '';
  }

  const parsed = new URL(trimmed);

  if (!parsed.pathname) {
    parsed.pathname = '/';
  }

  if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
    parsed.port = '';
  }

  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = '';

  return parsed.toString();
};

export const isValidHttpUrl = (url) =>
  isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
    disallow_auth: true,
    require_tld: false,
  });

export const isPotentiallyUnsafeHost = (url) => {
  const parsed = new URL(url);
  const host = parsed.hostname;

  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host));
};
