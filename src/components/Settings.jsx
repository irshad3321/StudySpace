import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

export default function Settings() {
  const { user, updateUserProfile } = useAuth();

  // Load preferences from localStorage or defaults
  const savedPrefs = (() => {
    try {
      const data = localStorage.getItem('studyspace_settings');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  })();

  const [name, setName] = useState(user?.name || savedPrefs.name || 'Irshad');
  const [email] = useState(user?.email || savedPrefs.email || 'irshad@example.com');
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode ?? savedPrefs.darkMode ?? false);
  const [reminder, setReminder] = useState(user?.settings?.reminder ?? savedPrefs.reminder ?? false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [saveBanner, setSaveBanner] = useState('');

  // Keep name and settings in sync if user loads later
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
      setTempName(user.name);
    }
    if (user?.settings) {
      if (typeof user.settings.darkMode === 'boolean') {
        setDarkMode(user.settings.darkMode);
      }
      if (typeof user.settings.reminder === 'boolean') {
        setReminder(user.settings.reminder);
      }
    }
  }, [user]);

  // Apply dark mode theme to HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Persist preferences locally
  useEffect(() => {
    const prefs = {
      name,
      email,
      darkMode,
      reminder
    };
    localStorage.setItem('studyspace_settings', JSON.stringify(prefs));
  }, [name, email, darkMode, reminder]);

  const [savingName, setSavingName] = useState(false);

  const showNotification = (msg) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(''), 2500);
  };

  const handleSaveName = async () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setSavingName(true);
      setName(trimmed);
      if (updateUserProfile) {
        const res = await updateUserProfile({ name: trimmed });
        if (res && res.success) {
          showNotification('Profile name saved to database');
        } else {
          showNotification('Profile name updated locally');
        }
      } else {
        showNotification('Profile name updated');
      }
      setSavingName(false);
      setIsEditingName(false);
    }
  };

  const handleToggleDarkMode = async () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    showNotification(nextVal ? 'Dark mode enabled' : 'Light mode enabled');
    if (updateUserProfile) {
      await updateUserProfile({
        settings: {
          darkMode: nextVal,
          reminder
        }
      });
    }
  };

  const handleToggleReminder = async () => {
    const nextVal = !reminder;
    setReminder(nextVal);
    showNotification(nextVal ? 'Daily reminders enabled' : 'Daily reminders disabled');
    if (updateUserProfile) {
      await updateUserProfile({
        settings: {
          darkMode,
          reminder: nextVal
        }
      });
    }
  };

  return (
    <div className="settings-container">
      {/* Settings Header */}
      <div className="settings-page-header">
        <h2 className="settings-main-title">Settings</h2>
        <p className="settings-main-subtitle">Manage your workspace preferences.</p>
      </div>

      {saveBanner && (
        <div className="settings-save-banner">
          <Check size={15} />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="settings-card-wrapper">
        {/* 1. ACCOUNT */}
        <section className="settings-group-section">
          <h3 className="settings-group-heading">ACCOUNT</h3>
          
          <div className="settings-table-row">
            <span className="settings-col-label">Profile name</span>
            <div className="settings-col-value-container">
              {isEditingName ? (
                <div className="settings-inline-form">
                  <input
                    type="text"
                    className="form-input settings-sm-input"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    autoFocus
                  />
                  <button 
                    className="btn-primary btn-sm" 
                    onClick={handleSaveName}
                    disabled={savingName}
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={() => {
                      setTempName(name);
                      setIsEditingName(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="settings-static-row">
                  <span className="settings-value-text">{name}</span>
                  <button 
                    className="settings-action-link" 
                    onClick={() => {
                      setTempName(name);
                      setIsEditingName(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="settings-table-row">
            <span className="settings-col-label">Email address</span>
            <div className="settings-col-value-container">
              <div className="settings-static-row">
                <span className="settings-value-text settings-muted-text">{email}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. APPEARANCE */}
        <section className="settings-group-section">
          <h3 className="settings-group-heading">APPEARANCE</h3>

          <div className="settings-table-row">
            <span className="settings-col-label">Dark mode</span>
            <div className="settings-col-value-container">
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleToggleDarkMode}
                  aria-label="Toggle dark mode"
                />
                <span className="settings-slider" />
              </label>
            </div>
          </div>
        </section>

        {/* 3. NOTIFICATIONS */}
        <section className="settings-group-section" style={{ borderBottom: 'none' }}>
          <h3 className="settings-group-heading">NOTIFICATIONS</h3>

          <div className="settings-table-row">
            <span className="settings-col-label">Daily study reminder</span>
            <div className="settings-col-value-container">
              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={handleToggleReminder}
                  aria-label="Toggle daily study reminder"
                />
                <span className="settings-slider" />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
