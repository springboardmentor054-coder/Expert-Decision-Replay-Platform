import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import './Notifications.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'decisions', label: 'Decisions' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'system', label: 'System' },
];

const CATEGORY_ICON = {
  decisions: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  reviews: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </>
  ),
  system: (
    <>
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </>
  ),
};

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Notifications() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    notificationAPI
      .list()
      .then(({ data }) => setItems(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load notifications.')))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const visibleItems = useMemo(() => {
    const filtered = items.filter((n) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'unread') return !n.is_read;
      return n.category === activeFilter;
    });
    return [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [items, activeFilter]);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not mark all as read.'));
    }
  };

  const markOneRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await notificationAPI.markRead(id);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not mark notification as read.'));
    }
  };

  const deleteOne = async (id) => {
    const previous = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationAPI.remove(id);
      showToast('Notification deleted successfully!', 'success');
    } catch (err) {
      setItems(previous);
      setError(extractErrorMessage(err, 'Could not delete notification.'));
    }
  };

  return (
    <div className="notif-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="notif-header">
        <div>
          <h1 className="notif-title">Notifications</h1>
          <p className="notif-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>
        <button
          type="button"
          className="notif-mark-all"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {error && <p className="notif-error">{error}</p>}

      <div className="notif-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`notif-filter-tab ${activeFilter === f.key ? 'notif-filter-tab-active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="notif-filter-count">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="notif-list">
        {loading ? (
          <div className="notif-empty">
            <p>Loading...</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="notif-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p>Nothing here yet</p>
            <span>New notifications for this filter will show up here.</span>
          </div>
        ) : (
          visibleItems.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${!n.is_read ? 'notif-item-unread' : ''}`}
              onClick={() => markOneRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') markOneRead(n.id);
              }}
            >
              <span className={`notif-item-icon notif-item-icon-${n.category}`}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                  {CATEGORY_ICON[n.category]}
                </svg>
              </span>

              <span className="notif-item-body">
                <span className="notif-item-title-row">
                  <span className="notif-item-title">{n.title}</span>
                  {!n.is_read && <span className="notif-dot" aria-hidden="true" />}
                </span>
                <span className="notif-item-message">{n.message}</span>
                {n.decision_id && (
                  <Link
                    to={`/dashboard/decisions/${n.decision_id}`}
                    className="notif-item-decision-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Decision &rarr;
                  </Link>
                )}
              </span>

              <span className="notif-item-time">{timeAgo(n.created_at)}</span>

              <button
                type="button"
                className="notif-item-delete"
                aria-label="Delete notification"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOne(n.id);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
