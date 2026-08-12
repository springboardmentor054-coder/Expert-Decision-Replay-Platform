import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import './Sidebar.css';

const MENU_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    end: true,
    icon: (
      <>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
  },
  {
    to: '/dashboard/decisions',
    label: 'Decisions',
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    to: '/dashboard/users',
    label: 'Users',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  {
    to: '/dashboard/reports',
    label: 'Reports',
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15v3M12 11v7M17 7v11" />
      </>
    ),
  },
];

const RECORDS_ITEMS = [
  {
    to: '/dashboard/alternatives',
    label: 'Alternatives',
    icon: (
      <>
        <path d="M8 3v4M16 3v4" />
        <rect x="3" y="6" width="18" height="15" rx="2" />
        <path d="M3 11h18" />
        <path d="M9 15h6" />
      </>
    ),
  },
  {
    to: '/dashboard/documents',
    label: 'Documents',
    icon: (
      <>
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <path d="M13 2v7h7" />
      </>
    ),
  },
  {
    to: '/dashboard/discussions',
    label: 'Discussions',
    icon: (
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    ),
  },
  {
    to: '/dashboard/version-history',
    label: 'Version History',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    to: '/dashboard/notifications',
    label: 'Notifications',
    icon: (
      <>
        <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>
    ),
  },
];

const APPROVAL_ITEMS = [
  {
    to: '/dashboard/approvals',
    label: 'Pending Approvals',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    to: '/dashboard/approval-history',
    label: 'Approval History',
    icon: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </>
    ),
  },
];

const SECURITY_ITEMS = [
  {
    to: '/dashboard/audit-logs',
    label: 'Audit Logs',
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h4" />
      </>
    ),
  },
  {
    to: '/dashboard/permissions',
    label: 'Roles',
    icon: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </>
    ),
  },
];

const GENERAL_ITEMS = [
  {
    to: '/dashboard/profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
  {
    to: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
  },
];

function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const displayRole = user?.role || 'Team Member';

  const renderNavItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      onClick={onCloseMobile}
      className={({ isActive }) =>
        isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
      }
    >
      <svg
        className="sidebar-link-icon"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        {item.icon}
      </svg>
      <span className="sidebar-link-label">{item.label}</span>
      {item.badge ? <span className="sidebar-link-badge">{item.badge}</span> : null}
    </NavLink>
  );

  return (
    <>
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={onCloseMobile} />
      )}

      <aside
        className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${
          isMobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isCollapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
          </svg>
        </button>

        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-hex-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#D8B07A" strokeWidth="1.6">
              <path d="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-row">
              <p className="sidebar-brand-name">EDRP</p>
              <span className="sidebar-plan-tag">Enterprise</span>
            </div>
            <p className="sidebar-brand-sub">Expert Decision Replay Platform</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Menu</p>
          {MENU_ITEMS.map(renderNavItem)}

          <p className="sidebar-section-label sidebar-section-label-spaced">
            Records
          </p>
          {RECORDS_ITEMS.map(renderNavItem)}

          <p className="sidebar-section-label sidebar-section-label-spaced">
            Approvals
          </p>
          {APPROVAL_ITEMS.map(renderNavItem)}

          <p className="sidebar-section-label sidebar-section-label-spaced">
            Security
          </p>
          {SECURITY_ITEMS.map(renderNavItem)}

          <p className="sidebar-section-label sidebar-section-label-spaced">
            General
          </p>
          {GENERAL_ITEMS.map(renderNavItem)}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <Avatar user={user} />
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-email">{user?.email}</p>
              <p className="sidebar-user-role">{displayRole}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="sidebar-logout-label">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;