import React, { useState } from 'react';
import { authService } from '../firebase';

export default function AuthPanel({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // login, register, reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setPassword('');
  };

  const getErrorMessage = (errCode) => {
    const msg = errCode.message || errCode.toString();
    if (msg.includes('auth/invalid-credential') || msg.includes('invalid-password') || msg.includes('user-not-found')) {
      return 'Invalid email address or password. Please verify and try again.';
    }
    if (msg.includes('auth/email-already-in-use') || msg.includes('email-already-in-use')) {
      return 'An account with this email address already exists.';
    }
    if (msg.includes('auth/weak-password') || msg.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (msg.includes('auth/invalid-email') || msg.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const cred = await authService.signIn(email, password);
        onAuthSuccess(cred.user);
      } else if (activeTab === 'register') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const cred = await authService.signUp(email, password);
        onAuthSuccess(cred.user);
      } else if (activeTab === 'reset') {
        await authService.resetPassword(email);
        setSuccess('A password reset link has been dispatched to your email address.');
        setEmail('');
      }
    } catch (err) {
      console.error("Authentication action failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <span className="auth-subtitle">NM Beauty Collective</span>
          <h2>Partner Portal</h2>
          <p>
            {activeTab === 'login' && 'Sign in to access and manage your professional listing.'}
            {activeTab === 'register' && 'Register an account to publish your business to the web registry.'}
            {activeTab === 'reset' && 'Enter your email address to receive a secure password recovery link.'}
          </p>
        </div>

        {/* Tab Controls (Hidden for reset view) */}
        {activeTab !== 'reset' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Register
            </button>
          </div>
        )}

        {/* Alert Notifications */}
        {error && <div className="auth-alert alert-error">{error}</div>}
        {success && <div className="auth-alert alert-success">{success}</div>}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. hello@yourbrand.com"
              required
              autoComplete="username"
              inputMode="email"
            />
          </div>

          {activeTab !== 'reset' && (
            <div className="form-row password-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
                {activeTab === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => handleTabChange('reset')}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={activeTab === 'register' ? 'Choose a strong password (6+ chars)' : 'Enter your password'}
                  required
                  autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? (
              <span className="btn-spinner"></span>
            ) : (
              <span>
                {activeTab === 'login' && 'Sign In to Portal'}
                {activeTab === 'register' && 'Create Partner Account'}
                {activeTab === 'reset' && 'Send Recovery Email'}
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        {activeTab === 'reset' && (
          <div className="auth-footer">
            <button
              type="button"
              className="back-to-auth-btn"
              onClick={() => handleTabChange('login')}
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
