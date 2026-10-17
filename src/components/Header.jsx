import { Menu, Bell, Calendar as CalendarIcon, LogIn, CloudCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenSidebar, syncStatus = 'synced' }) {
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
        {user && (
          <div 
            className={`sync-status-pill ${syncStatus}`} 
            title={
              syncStatus === 'syncing' 
                ? 'Syncing with cloud database...' 
                : syncStatus === 'error' 
                ? 'Offline mode - changes cached locally' 
                : 'All changes synced to cloud account'
            }
          >
            {syncStatus === 'syncing' ? (
              <>
                <Loader2 size={13} className="spin-animate sync-icon-syncing" />
                <span className="sync-pill-text">Syncing...</span>
              </>
            ) : syncStatus === 'error' ? (
              <>
                <span className="sync-dot-offline" />
                <span className="sync-pill-text">Offline</span>
              </>
            ) : (
              <>
                <CloudCheck size={14} className="sync-icon-synced" />
                <span className="sync-pill-text">Cloud Synced</span>
              </>
            )}
          </div>
        )}

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
