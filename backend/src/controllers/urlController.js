import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';
import { urlService } from '../services/urlService.js';
import { qrCodeService } from '../services/qrCodeService.js';

const parseOptionalTtlSeconds = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpError(400, 'ttlSeconds must be a positive integer.');
  }

  return parsed;
};

export const urlController = {
  async shorten(req, res, next) {
    try {
      const ttlSeconds = parseOptionalTtlSeconds(req.body.ttlSeconds);
      const result = await urlService.createShortUrl({
        originalUrl: req.body.url,
        customCode: req.body.customCode,
        ttlSeconds,
        password: req.body.password,
        baseUrl: env.baseUrl,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async generateQRCode(req, res, next) {
    try {
      const shortUrl = `${env.baseUrl}/${req.params.shortCode}`;
      const qrCode = await qrCodeService.generateQRCode(shortUrl);

      if (!qrCode) {
        throw new HttpError(500, 'Failed to generate QR code.');
      }

      res.status(200).json({
        success: true,
        data: {
          qr: qrCode,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async redirect(req, res, next) {
    try {
      const destination = await urlService.resolveShortCode(req.params.shortCode);

      // If password protected, show HTML password form
      if (destination.requiresPassword) {
        const shortCode = req.params.shortCode;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔒 Password Protected Link</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f4e8d8 0%, #e8d4b8 100%);
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 16px;
    }
    .page-shell {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px 16px;
      width: 100%;
    }
    .panel {
      width: min(480px, 100%);
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid #f1cf9c;
      border-radius: 24px;
      box-shadow: 0 24px 60px rgba(94, 55, 12, 0.16);
      backdrop-filter: blur(8px);
      padding: 48px 32px;
    }
    .eyebrow {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin: 0 0 8px;
      color: #985408;
      text-align: center;
      font-weight: 700;
    }
    h1 { 
      margin: 0;
      text-align: center;
      font-size: clamp(24px, 5vw, 32px);
      line-height: 1.2;
      color: #1f1308;
      font-weight: 700;
    }
    .subtitle { 
      text-align: center;
      margin-top: 12px;
      color: #55351a;
      font-size: 15px;
      line-height: 1.5;
    }
    .form-container {
      margin-top: 28px;
      display: grid;
      gap: 16px;
    }
    .form-group { 
      display: grid;
      gap: 8px;
    }
    label { 
      display: block;
      font-weight: 600;
      color: #41250c;
      font-size: 14px;
    }
    input[type="password"] {
      width: 100%;
      border: 1px solid #e4bc84;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 15px;
      background: #fff8f0;
      font-family: inherit;
      transition: all 0.3s ease;
    }
    input[type="password"]:focus { 
      outline: none;
      border-color: #d7801d;
      box-shadow: 0 0 0 3px rgba(215, 128, 29, 0.2);
      background: #fffbf7;
    }
    input[type="password"]::placeholder {
      color: #b8906b;
    }
    button {
      width: 100%;
      padding: 13px 16px;
      background: linear-gradient(90deg, #ff7d2c, #ffab4d);
      color: #1c1005;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.3s ease, transform 0.2s ease;
      margin-top: 8px;
      box-shadow: 0 4px 12px rgba(255, 125, 44, 0.25);
    }
    button:not(:disabled):hover { 
      opacity: 0.92;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 125, 44, 0.35);
    }
    button:not(:disabled):active { 
      transform: translateY(0);
    }
    button:disabled { 
      opacity: 0.7;
      cursor: not-allowed;
    }
    .message {
      margin-top: 14px;
      padding: 14px;
      border-radius: 12px;
      font-size: 14px;
      display: none;
      font-weight: 500;
      border: 1px solid;
    }
    .message.show { display: block; }
    .error { 
      background: #fff2f2;
      color: #8c1e1e;
      border-color: #e67c7c;
    }
    .success { 
      background: #f4ffe8;
      color: #264011;
      border-color: #cbe5b1;
    }
  </style>
</head>
<body>
  <div class="page-shell">
    <div class="panel">
      <div class="eyebrow">Protected Link</div>
      <h1>Password Required</h1>
      <p class="subtitle">This link is password protected. Enter the password below to continue.</p>
      
      <form id="form" class="form-container">
        <div class="form-group">
          <label for="pwd">Password</label>
          <input type="password" id="pwd" placeholder="Enter the password" autofocus required>
        </div>
        <button type="submit" id="btn">Unlock Link</button>
        <div id="msg" class="message"></div>
      </form>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const pwd = document.getElementById('pwd');
    const btn = document.getElementById('btn');
    const msg = document.getElementById('msg');
    const code = '${shortCode}';
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.className = 'message';
      msg.textContent = '';
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Unlocking...';
      
      try {
        const res = await fetch('/' + code + '/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd.value })
        });
        
        const data = await res.json();
        
        if (data.success && data.originalUrl) {
          msg.className = 'message success show';
          msg.textContent = '✓ Correct password! Redirecting...';
          setTimeout(() => window.location = data.originalUrl, 1000);
        } else {
          msg.className = 'message error show';
          msg.textContent = '✗ ' + (data.error || 'Wrong password. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Unlock Link';
          pwd.value = '';
          pwd.focus();
        }
      } catch (e) {
        msg.className = 'message error show';
        msg.textContent = '✗ Error: ' + e.message;
        btn.disabled = false;
        btn.textContent = 'Unlock Link';
      }
    });
  </script>
</body>
</html>`;
        return res.status(200).send(html);
      }

      res.redirect(env.defaultRedirectStatusCode, destination.originalUrl);
    } catch (error) {
      next(error);
    }
  },

  async verifyPassword(req, res, next) {
    try {
      const destination = await urlService.verifyAndResolveShortCode(
        req.params.shortCode,
        req.body.password,
      );

      res.status(200).json({
        success: true,
        originalUrl: destination,
      });
    } catch (error) {
      next(error);
    }
  },
};
