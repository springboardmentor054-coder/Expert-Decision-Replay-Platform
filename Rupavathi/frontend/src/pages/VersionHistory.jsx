import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { decisionVersionAPI, decisionAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './VersionHistory.css';

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

function VersionHistory() {
  const { decisionId } = useParams();
  const [decision, setDecision] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([decisionAPI.get(decisionId), decisionVersionAPI.listForDecision(decisionId)])
      .then(([decisionRes, versionsRes]) => {
        if (cancelled) return;
        setDecision(decisionRes.data);
        setVersions(versionsRes.data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load version history.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [decisionId]);

  const latestVersionNumber = versions[0]?.version_number;

  return (
    <div className="version-history-page">
      <BackButton to={`/dashboard/decisions/${decisionId}`}>Back to Decision</BackButton>

      <div className="version-history-page-header">
        <h1>Version History{decision ? ` for "${decision.title}"` : ''}</h1>
        <p>Every change to this decision's title, description, or status is recorded here automatically.</p>
      </div>

      <div className="version-history-panel">
        {error && <p className="version-history-form-error">{error}</p>}

        {loading ? (
          <div className="version-history-loading">Loading version history...</div>
        ) : versions.length === 0 ? (
          <div className="version-history-empty">No version history yet.</div>
        ) : (
          <table className="version-history-table">
            <thead>
              <tr>
                <th>Version Number</th>
                <th>Modified By</th>
                <th>Modified Date</th>
                <th>Status</th>
                <th>Change Summary</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id}>
                  <td className="version-history-number">
                    v{version.version_number}
                    {version.version_number === latestVersionNumber && (
                      <span className="version-history-latest-badge">Latest</span>
                    )}
                  </td>
                  <td>{version.modifier.full_name}</td>
                  <td>{formatDateTime(version.modified_at)}</td>
                  <td>
                    <StatusBadge status={version.status} />
                  </td>
                  <td>{version.change_summary || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default VersionHistory;
