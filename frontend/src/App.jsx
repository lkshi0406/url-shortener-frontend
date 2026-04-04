import { useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          customCode: customCode || undefined,
          ttlSeconds: ttlSeconds ? parseInt(ttlSeconds) : undefined,
          password: password || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to shorten URL.');
      }

      setResult(payload.data);
      setPassword('');
      setUrl('');
      setCustomCode('');
      setTtlSeconds('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      setError('Please enter a password');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${result.shortCode}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: verifyPassword }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Incorrect password.');
      }

      setVerifyPassword('');
      setRequiresPassword(false);
      window.location.href = payload.originalUrl;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <p className="eyebrow">Production-ready URL Shortener</p>
        <h1>Shrink links with custom codes & protection.</h1>
        <p className="subtitle">
          PostgreSQL for durable mapping, QR codes, password protection, and clean Express architecture.
        </p>

        <form className="shorten-form" onSubmit={handleSubmit}>
          <label>
            Long URL
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/path?source=campaign"
            />
          </label>

          <div className="form-row">
            <label>
              Custom code (optional)
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-launch"
              />
            </label>

            <label>
              TTL in seconds (optional)
              <input
                type="number"
                min="1"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="86400"
              />
            </label>
          </div>

          <label>
            Password protection (optional)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optional password (4+ chars)"
            />
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate short URL'}
          </button>
        </form>

        {error && <p className="error-box">{error}</p>}

        {requiresPassword && (
          <article className="result-box password-box">
            <h2>🔒 Password Required</h2>
            <p>This short link is password protected. Enter the password to access it.</p>
            <input
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              placeholder="Enter password"
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleVerifyPassword} className="unlock-btn">
                ✓ Unlock & Redirect
              </button>
              <button
                onClick={() => {
                  setRequiresPassword(false);
                  setVerifyPassword('');
                }}
                style={{ background: '#999' }}
              >
                Cancel
              </button>
            </div>
          </article>
        )}

        {result && (
          <article className="result-box">
            <h2>✓ Short URL Created</h2>

            <div className="short-url-container">
              <label>Your Short URL:</label>
              <div className="short-url-display">
                {result.isPasswordProtected ? (
                  <span className="protected-url">{result.shortUrl}</span>
                ) : (
                  <a href={result.shortUrl} target="_blank" rel="noreferrer">
                    {result.shortUrl}
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  if (result.isPasswordProtected) {
                    setRequiresPassword(true);
                  } else {
                    window.location.href = result.shortUrl;
                  }
                }}
                className="visit-btn"
              >
                {result.isPasswordProtected ? '🔒 Request Access' : '→ Visit Now'}
              </button>
            </div>

            <p>Short code: <code>{result.shortCode}</code></p>
            {result.isPasswordProtected && <p className="badge">🔒 Password protected</p>}
            <p>Created: {new Date(result.createdAt).toLocaleString()}</p>
            <p>Clicks: {result.clickCount}</p>

            {result.shortUrl && (
              <div className="qr-section">
                <h3>📱 QR Code</h3>
                <div className="qr-container">
                  <p>QR code feature coming soon - share the short URL above!</p>
                </div>
              </div>
            )}
          </article>
        )}

        <p className="hint">
          Backend health: <a href={`${API_BASE}/health`} target="_blank" rel="noreferrer">API Status</a>
        </p>
      </section>
    </main>
  );
}

export default App;
