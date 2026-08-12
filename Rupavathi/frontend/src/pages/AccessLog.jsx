import { useEffect, useState } from 'react';
import { accessLogAPI, extractErrorMessage } from '../services/api';
import BackButton from '../components/BackButton';
import './AccessLog.css';

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

function AccessLog() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    accessLogAPI
      .list()
      .then(({ data }) => setEntries(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load your access log.')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="access-log-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="access-log-page-header">
        <h1>Access Log</h1>
        <p>A history of sign-ins to your account.</p>
      </div>

      <div className="access-log-panel">
        {error && <p className="access-log-error">{error}</p>}

        {loading ? (
          <div className="access-log-empty">Loading access log...</div>
        ) : entries.length === 0 ? (
          <div className="access-log-empty">No access history recorded yet.</div>
        ) : (
          <table className="access-log-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>IP Address</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="access-log-action">
                    <span className="access-log-dot" />
                    {entry.action}
                  </td>
                  <td>{entry.ip_address || '—'}</td>
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

export default AccessLog;
