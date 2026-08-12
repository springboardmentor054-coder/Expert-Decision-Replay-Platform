import { useEffect, useState } from 'react';
import { auditLogAPI, userAPI, extractErrorMessage } from '../services/api';
import CustomSelect from '../components/CustomSelect';
import BackButton from '../components/BackButton';
import './AuditLogs.css';

const ACTION_TYPES = [
  'Login',
  'Decision Created',
  'Decision Updated',
  'Decision Deleted',
  'Document Uploaded',
  'Comment Added',
  'Decision Approved',
  'Decision Rejected',
];

function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState('');
  const [actionType, setActionType] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    userAPI
      .list()
      .then(({ data }) => setUsers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const filters = {};
    if (userId) filters.user_id = userId;
    if (actionType) filters.action_type = actionType;
    if (date) filters.date = date;

    auditLogAPI
      .list(filters)
      .then(({ data }) => {
        if (!cancelled) setLogs(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load audit logs.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, actionType, date]);

  const clearFilters = () => {
    setUserId('');
    setActionType('');
    setDate('');
  };

  const hasActiveFilters = userId || actionType || date;

  return (
    <div className="audit-log-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="audit-log-page-header">
        <h1>Audit Logs</h1>
        <p>A complete, tamper-proof trail of every action taken across the platform.</p>
      </div>

      <div className="audit-log-toolbar">
        <div className="audit-log-filter">
          <label htmlFor="audit-filter-user">User</label>
          <CustomSelect
            id="audit-filter-user"
            value={userId}
            onChange={setUserId}
            placeholder="All Users"
            options={[
              { value: '', label: 'All Users' },
              ...users.map((u) => ({ value: String(u.id), label: u.full_name })),
            ]}
          />
        </div>

        <div className="audit-log-filter">
          <label htmlFor="audit-filter-action">Action Type</label>
          <CustomSelect
            id="audit-filter-action"
            value={actionType}
            onChange={setActionType}
            placeholder="All Actions"
            options={[
              { value: '', label: 'All Actions' },
              ...ACTION_TYPES.map((type) => ({ value: type, label: type })),
            ]}
          />
        </div>

        <div className="audit-log-filter">
          <label htmlFor="audit-filter-date">Date</label>
          <input
            id="audit-filter-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <button type="button" className="audit-log-clear-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="audit-log-panel">
        {error && <p className="audit-log-error">{error}</p>}

        {loading ? (
          <div className="audit-log-empty">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="audit-log-empty">No audit log entries match these filters.</div>
        ) : (
          <table className="audit-log-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Action Type</th>
                <th>Decision Title</th>
                <th>Description</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id}>
                  <td className="audit-log-user">{entry.user?.full_name || '—'}</td>
                  <td>
                    <span className="audit-log-action-badge">{entry.action_type}</span>
                  </td>
                  <td>{entry.decision?.title || '—'}</td>
                  <td className="audit-log-description">{entry.description}</td>
                  <td>{formatDateTime(entry.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;
