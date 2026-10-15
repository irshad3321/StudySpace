import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  CalendarRange, 
  CheckSquare, 
  Settings, 
  X,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeNav, onSelectNav, taskCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan', label: 'My Study Plan', icon: CalendarRange, badge: taskCount },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
          <div className="user-profile-card">
            <div className="avatar-badge">
              <span>IR</span>
              <span className="avatar-online-dot" />
            </div>
            <div className="user-details">
              <span className="user-name">Irshad</span>
              <span className="user-role">DSA & CS Prep</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
