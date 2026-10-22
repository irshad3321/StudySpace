import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  CalendarRange, 
  CheckSquare, 
  NotebookPen,
  Settings, 
  X,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose, activeNav, onSelectNav, taskCount, noteCount }) {
  const { user, logout, openAuthModal } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan', label: 'My Study Plan', icon: CalendarRange, badge: taskCount },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: NotebookPen, badge: noteCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <BookOpen size={20} strokeWidth={2.2} />
            </div>
            <div className="brand-title-group">
              <span className="brand-name">StudySpace</span>
              <span className="brand-tagline">Planner</span>
            </div>
          </div>

          <button 
            className="sidebar-close-btn" 
            onClick={onClose} 
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav-container">
          <span className="nav-section-label">Workspace</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectNav(item.id);
                  onClose();
                }}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile-card">
              <div className="avatar-badge">
                <span>{getInitials(user.name)}</span>
                <span className="avatar-online-dot" />
              </div>
              <div className="user-details" style={{ flex: 1 }}>
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.track || 'Student'}</span>
              </div>
              <button 
                className="btn-logout" 
                onClick={logout} 
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn-signin-sidebar" 
              onClick={() => openAuthModal('login')}
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
