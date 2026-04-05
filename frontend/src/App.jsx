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
                      alert('Copied!');
                    }}
                    className="copy-btn"
                  >
                    Copy
                  </button>
                </div>
                {result.isPasswordProtected && <span className="badge">🔒 Protected</span>}
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
            <div className="qr-mockup">QR Code</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-box">
              <span className="icon">🔗</span>
              <h3>Custom Short Links</h3>
              <p>Create branded short links with custom codes that match your brand identity</p>
            </div>
            <div className="feature-box">
              <span className="icon">🔒</span>
              <h3>Password Protection</h3>
              <p>Protect sensitive links with password authentication for added security</p>
            </div>
            <div className="feature-box">
              <span className="icon">📊</span>
              <h3>Analytics & Tracking</h3>
              <p>Track clicks, locations, and devices with detailed analytics dashboard</p>
            </div>
            <div className="feature-box">
              <span className="icon">⏰</span>
              <h3>Link Expiration</h3>
              <p>Set expiration dates on links with customizable TTL settings</p>
            </div>
            <div className="feature-box">
              <span className="icon">📱</span>
              <h3>QR Code Generation</h3>
              <p>Generate QR codes automatically for easy sharing on multiple platforms</p>
            </div>
            <div className="feature-box">
              <span className="icon">🌍</span>
              <h3>Globally Fast</h3>
              <p>Lightning-fast redirects powered by global CDN infrastructure</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Paste URL</h3>
              <p>Paste any long URL into our shortening tool</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Customize (Optional)</h3>
              <p>Add custom codes, passwords, or expiration dates</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Share & Track</h3>
              <p>Share your short link and track clicks in real-time</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Analyze</h3>
              <p>Get detailed insights with our analytics dashboard</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
