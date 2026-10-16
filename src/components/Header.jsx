import React from 'react';
import { Menu, Bell, Calendar as CalendarIcon, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenSidebar }) {
  const { user, openAuthModal } = useAuth();

  // Format current date nicely
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Dynamic greeting based on current time
  const currentHour = today.getHours();
  let timeGreeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good evening';
  }

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onOpenSidebar} 
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="greeting-title">
            {timeGreeting}, {user ? user.name : 'Student'}
          </h1>
          <p className="greeting-subtitle">Make today count. One task at a time.</p>
        </div>
      </div>

      <div className="header-right">
        <div className="date-pill" title="Today's date">
          <CalendarIcon size={14} className="date-icon" />
          <span>{formattedDate}</span>
        </div>

        <button 
          className="icon-button" 
          aria-label="View notifications" 
          title="Notifications"
        >
          <Bell size={18} />
          <span className="notification-badge-dot" />
        </button>

        {user ? (
          <div className="header-avatar" title={user.name}>
            <span>{getInitials(user.name)}</span>
          </div>
        ) : (
          <button 
            className="btn-header-signin" 
            onClick={() => openAuthModal('login')}
            title="Sign In"
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
