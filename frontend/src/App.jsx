import { useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setQrCode(null);

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

      // Fetch QR code
      fetchQRCode(payload.data.shortUrl);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQRCode = async (shortUrl) => {
    try {
      setQrLoading(true);
      const shortCode = shortUrl.split('/').pop();
      const response = await fetch(`${API_BASE}/${shortCode}/qr`, {
        method: 'GET',
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        console.error('Failed to generate QR code');
        return;
      }

      setQrCode(payload.data.qr);
    } catch (qrError) {
      console.error('QR code fetch error:', qrError);
    } finally {
      setQrLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      setError('Please enter a password');
      return;
    }

    try {
      const shortCode = result.shortUrl.split('/').pop();
      const response = await fetch(`${API_BASE}/${shortCode}/verify-password`, {
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
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">∞ SHORTIE</div>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
          </nav>
          <button className="login-btn">Login</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              BIO LINK & LINK<br />SHORTENER 🔗 FOR<br />BUSINESS NEEDS
            </h1>
            <p className="hero-subtitle">
              Create short, memorable links with custom codes. Track clicks, protect with passwords, and manage all your links in one place.
            </p>

            {/* Main Form */}
            <form className="shorten-form" onSubmit={handleSubmit}>
              <div className="form-wrapper">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a long URL here..."
                  className="main-input"
                />
                <button type="submit" disabled={isLoading} className="shorten-btn">
                  {isLoading ? 'Creating...' : 'Shorten Link'}
                </button>
              </div>

              {/* Advanced Options */}
              <div className="advanced-options">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="Custom code (optional)"
                  className="option-input"
                />
                <input
                  type="number"
                  min="1"
                  value={ttlSeconds}
                  onChange={(e) => setTtlSeconds(e.target.value)}
                  placeholder="Expires in (seconds)"
                  className="option-input"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password protect (optional)"
                  className="option-input"
                />
              </div>
            </form>

            {error && <p className="error-message">{error}</p>}

            {/* Result */}
            {result && (
              <div className="result-card">
                <div className="result-header">✓ Link Created Successfully</div>
                <div className="result-url">
                  {result.isPasswordProtected ? (
                    <span>{result.shortUrl}</span>
                  ) : (
                    <a href={result.shortUrl} target="_blank" rel="noreferrer">
                      {result.shortUrl}
                    </a>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.shortUrl);
                      setCopyMessage('Copied!');
                      setTimeout(() => setCopyMessage(''), 2000);
                    }}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </div>
                {copyMessage && <span className="copy-message">{copyMessage}</span>}
                {result.isPasswordProtected && <span className="badge">🔒 Protected</span>}
                
                {/* QR Code */}
                {qrLoading ? (
                  <p style={{ textAlign: 'center', marginTop: '16px', color: '#888' }}>Generating QR code...</p>
                ) : qrCode ? (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                  </div>
                ) : null}
              </div>
            )}

            {requiresPassword && (
              <div className="password-request">
                <input
                  type="password"
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  placeholder="Enter password"
                  className="password-input"
                />
                <button onClick={handleVerifyPassword} className="unlock-btn">
                  Unlock
                </button>
              </div>
            )}

            <div className="hero-stats">
              <div className="stat">
                <strong>10M+</strong> Links Created
              </div>
              <div className="stat">
                <strong>99.9%</strong> Uptime
              </div>
              <div className="stat">
                <strong>256-bit</strong> Encryption
              </div>
            </div>
          </div>

          <div className="hero-image">
            {qrCode ? (
              <div className="qr-mockup">
                <img src={qrCode} alt="Generated QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div className="qr-mockup">QR Code</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
