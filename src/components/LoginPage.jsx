import React, { useState } from 'react';
import { BookOpen, LogIn, UserPlus, AlertCircle, ArrowRight, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [track, setTrack] = useState('DSA & CS Prep');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    let res;
    if (mode === 'login') {
      res = await login(email, password);
    } else if (mode === 'register') {
      res = await register(name, email, password, track);
    } else if (mode === 'forgot') {
      if (newPassword !== confirmPassword) {
        setLoading(false);
        setErrorMsg('Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setLoading(false);
        setErrorMsg('Password must be at least 6 characters');
        return;
      }
      res = await resetPassword(email, newPassword);
    }

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Action failed');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-badge">
            <BookOpen size={24} strokeWidth={2.4} />
          </div>
          <h1 className="login-brand-title">StudySpace</h1>
          <p className="login-brand-subtitle">
            Personal Study Planner — Make today count, one task at a time.
          </p>
        </div>

        {/* Auth Card */}
        <div className="login-card">
          {/* Tab Switch or Back Button */}
          {mode === 'forgot' ? (
            <div className="auth-tab-switch auth-recovery-header">
              <button
                type="button"
                className="auth-back-link"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Sign In</span>
              </button>
              <div className="auth-recovery-title">
                <KeyRound size={15} />
                <span>Password Recovery</span>
              </div>
            </div>
          ) : (
            <div className="auth-tab-switch" style={{ borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="auth-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'forgot' ? (
              <>
                <p className="auth-sub-instruction">
                  Enter your registered email and choose a new password to recover access to your workspace.
                </p>

                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">Registered Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-new-password" className="form-label">New Password</label>
                  <input
                    id="login-new-password"
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-confirm-password" className="form-label">Confirm New Password</label>
                  <input
                    id="login-confirm-password"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary login-submit-btn"
                  disabled={loading}
                >
                  <span>{loading ? 'Resetting Password...' : 'Reset Password & Sign In'}</span>
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                {mode === 'register' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="login-name" className="form-label">Full Name</label>
                      <input
                        id="login-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Irshad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="login-track" className="form-label">Study Track</label>
                      <select
                        id="login-track"
                        className="form-select"
                        value={track}
                        onChange={(e) => setTrack(e.target.value)}
                      >
                        <option value="DSA & CS Prep">DSA & CS Prep</option>
                        <option value="Full Stack Development">Full Stack Development</option>
                        <option value="Machine Learning & AI">Machine Learning & AI</option>
                        <option value="Core CS & Systems">Core CS & Systems</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    className="form-input"
                    placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary login-submit-btn"
                  disabled={loading}
                >
                  <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </form>

          {/* Productivity note */}
          <div className="login-card-footer">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} style={{ color: 'var(--accent)' }} />
              <span>Plan your daily study goals and build lasting productivity.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
