import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Sparkles, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [track, setTrack] = useState('DSA & CS Prep');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    let res;
    if (authMode === 'login') {
      res = await login(email, password);
    } else if (authMode === 'register') {
      res = await register(name, email, password, track);
    } else if (authMode === 'forgot') {
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
    } else {
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {authMode === 'forgot' ? (
              <KeyRound size={18} style={{ color: 'var(--accent)' }} />
            ) : (
              <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            )}
            <h2 className="modal-title">
              {authMode === 'login'
                ? 'Sign In to StudySpace'
                : authMode === 'register'
                ? 'Create Student Account'
                : 'Reset Password'}
            </h2>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={closeAuthModal} 
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch or Back button */}
        {authMode === 'forgot' ? (
          <div className="auth-tab-switch auth-recovery-header" style={{ padding: '10px 16px' }}>
            <button
              type="button"
              className="auth-back-link"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="auth-error-banner" style={{ margin: '14px 18px 0' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {authMode === 'forgot' ? (
              <>
                <p className="auth-sub-instruction" style={{ marginBottom: '14px' }}>
                  Enter your registered email and choose a new password.
                </p>

                <div className="form-group">
                  <label htmlFor="modal-forgot-email" className="form-label">Registered Email</label>
                  <input
                    id="modal-forgot-email"
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
                  <label htmlFor="modal-forgot-newpwd" className="form-label">New Password</label>
                  <input
                    id="modal-forgot-newpwd"
                    type="password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-forgot-confirmpwd" className="form-label">Confirm New Password</label>
                  <input
                    id="modal-forgot-confirmpwd"
                    type="password"
                    className="form-input"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {authMode === 'register' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="auth-name" className="form-label">Full Name</label>
                      <input
                        id="auth-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Irshad"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="auth-track" className="form-label">Study Track</label>
                      <select
                        id="auth-track"
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
                  <label htmlFor="auth-email" className="form-label">Email Address</label>
                  <input
                    id="auth-email"
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
                    <label htmlFor="auth-password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        className="forgot-password-link"
                        onClick={() => {
                          setAuthMode('forgot');
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
                    id="auth-password"
                    type="password"
                    className="form-input"
                    placeholder={authMode === 'register' ? 'At least 6 characters' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={closeAuthModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span>Please wait...</span>
              ) : authMode === 'login' ? (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              ) : authMode === 'register' ? (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Reset & Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
