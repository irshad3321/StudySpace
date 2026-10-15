import React from 'react';
import { Menu, Bell, Calendar as CalendarIcon } from 'lucide-react';

export default function Header({ onOpenSidebar }) {
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
          <h1 className="greeting-title">{timeGreeting}, Irshad</h1>
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

        <div className="header-avatar" title="Irshad">
          <span>IR</span>
        </div>
      </div>
    </header>
  );
}
