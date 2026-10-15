import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [track, setTrack] = useState('DSA & CS Prep');
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
    } else {
      res = await register(name, email, password, track);
    }

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setErrorMsg('');
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="modal-title">
              {authMode === 'login' ? 'Sign In to StudySpace' : 'Create Student Account'}
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

        {/* Tab switch */}
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

        {/* Error Notification */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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
              <label htmlFor="auth-password" className="form-label">Password</label>
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
              {authMode === 'login' ? (
                <>
                  <LogIn size={16} />
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>{loading ? 'Creating...' : 'Create Account'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
