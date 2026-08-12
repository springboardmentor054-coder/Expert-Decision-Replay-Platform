import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';
import { notificationAPI } from '../services/api';
import Avatar from './Avatar';
import './Navbar.css';

const POLL_INTERVAL_MS = 15000;

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/decisions': 'Decisions',
  '/dashboard/alternatives': 'Alternatives',
  '/dashboard/documents': 'Documents',
  '/dashboard/discussions': 'Discussions',
  '/dashboard/version-history': 'Version History',
  '/dashboard/users': 'Users',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/audit-logs': 'Audit Logs',
  '/dashboard/reports/decisions': 'Decision Report',
  '/dashboard/reports/approvals': 'Approval Report',
  '/dashboard/reports/teams': 'Team Report',
  '/dashboard/reports/audit': 'Audit Report',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
};

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { notificationPrefs } = usePreferences();
  const notificationPrefsRef = useRef(notificationPrefs);
  notificationPrefsRef.current = notificationPrefs;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIds = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';
  const displayName = user?.name || user?.email || 'there';

  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      notificationAPI
        .list()
        .then(({ data }) => {
          if (cancelled) return;
          setUnreadCount(data.filter((n) => !n.is_read).length);

          if (seenIds.current === null) {
            seenIds.current = new Set(data.map((n) => n.id));
            return;
          }

          const newOnes = data.filter((n) => !n.is_read && !seenIds.current.has(n.id));
          newOnes
            .slice()
            .reverse()
            .filter((n) => notificationPrefsRef.current[n.category] !== false)
            .forEach((n) => showToast(n.title, 'success'));
          seenIds.current = new Set(data.map((n) => n.id));
        })
        .catch(() => {});
    };

    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [location.pathname, showToast]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/dashboard/decisions?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleBellClick = () => {
    navigate('/dashboard/notifications');
  };

  return (
    <header className="navbar">
      <div className="navbar-top-row">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="navbar-title">{pageTitle}</h2>

        <div className="navbar-actions">
          <button
            className="navbar-icon-btn"
            aria-label="Notifications"
            onClick={handleBellClick}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
          </button>

          <div className="navbar-user-menu">
            <button
              className="navbar-user-trigger"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <div className="navbar-avatar">
                <Avatar user={user} />
              </div>
              <svg
                className={`navbar-chevron ${menuOpen ? 'navbar-chevron-open' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="navbar-menu-overlay"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <div className="navbar-dropdown-avatar">
                      <Avatar user={user} />
                    </div>
                    <div>
                      <p className="navbar-dropdown-name">{displayName}</p>
                      <p className="navbar-dropdown-email">{user?.email}</p>
                    </div>
                  </div>

                  <div className="navbar-dropdown-body">
                    <Link
                      to="/dashboard/profile"
                      className="navbar-dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="navbar-dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                      </svg>
                      Settings
                    </Link>
                  </div>

                  <div className="navbar-dropdown-footer">
                    <button
                      className="navbar-dropdown-item navbar-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search decisions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>
    </header>
  );
}

export default Navbar;