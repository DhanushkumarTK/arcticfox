import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { GOOGLE_SCRIPT_URL } from '../config';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (isSignup && !form.name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const userSession = {
        name: isSignup ? form.name : (form.name || form.email.split('@')[0]),
        email: form.email,
        phone: form.phone || '',
      };
      localStorage.setItem('arcticfox-user', JSON.stringify(userSession));

      if (!GOOGLE_SCRIPT_URL) {
        // Demo mode — no Google Script URL configured
        console.log('Demo mode — data would be sent:', {
          action: isSignup ? 'signup' : 'login',
          ...form,
        });
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      const payload = {
        action: isSignup ? 'signup' : 'login',
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // With no-cors, we can't read the response, but the data is sent
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left — branding panel */}
      <div className="auth-brand-panel" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero1.png)` }}>
        <div className="auth-brand-overlay">
          <a href="/" className="auth-logo">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Arctic Fox" />
            <span>Arctic Fox</span>
          </a>
          <div className="auth-brand-content">
            <h1>Welcome to<br />the Pack.</h1>
            <p>Premium streetwear crafted with spirit. Sign in to access exclusive drops, track orders, and join our community.</p>
            <div className="auth-features">
              <div className="auth-feature"><FiCheck /> Early access to new drops</div>
              <div className="auth-feature"><FiCheck /> Exclusive member discounts</div>
              <div className="auth-feature"><FiCheck /> Order tracking & wishlist</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Mobile logo */}
          <a href="/" className="auth-mobile-logo">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Arctic Fox" />
            <span>Arctic Fox</span>
          </a>

          <div className="auth-form-header">
            <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignup ? 'Join the Arctic Fox family today' : 'Sign in to continue to your account'}</p>
          </div>

          {/* Toggle tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${!isSignup ? 'active' : ''}`}
              onClick={() => { setIsSignup(false); setError(''); setSuccess(false); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${isSignup ? 'active' : ''}`}
              onClick={() => { setIsSignup(true); setError(''); setSuccess(false); }}
            >
              Sign Up
            </button>
          </div>

          {/* Success message */}
          {success && (
            <div className="auth-success">
              <FiCheck />
              <span>{isSignup ? 'Account created successfully!' : 'Signed in successfully!'} Redirecting...</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="auth-error">{error}</div>
          )}

          {/* Form */}
          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="auth-input-group">
                  <FiUser className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-input-group">
                <FiMail className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              {isSignup && (
                <div className="auth-input-group">
                  <FiPhone className="auth-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              )}

              <div className="auth-input-group">
                <FiLock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {!isSignup && (
                <div className="auth-extras">
                  <label className="auth-remember">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className="auth-forgot">Forgot Password?</a>
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    {isSignup ? 'Create Account' : 'Sign In'}
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social-btns">
            <button className="auth-social-btn" type="button">
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <p className="auth-footer-text">
            {isSignup
              ? 'Already have an account? '
              : "Don't have an account? "}
            <button
              type="button"
              className="auth-switch"
              onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(false); }}
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
