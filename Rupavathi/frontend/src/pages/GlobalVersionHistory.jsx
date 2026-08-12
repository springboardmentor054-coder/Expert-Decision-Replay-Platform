import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { decisionVersionAPI, extractErrorMessage } from '../services/api';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import './GlobalList.css';

const PAGE_SIZE = 10;

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

function GlobalVersionHistory() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    decisionVersionAPI
      .listAll()
      .then(({ data }) => setVersions(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load version history.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return versions;
    return versions.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.modifier.full_name.toLowerCase().includes(term)
    );
  }, [versions, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="global-list-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="global-list-header">
        <h1>Version History</h1>
        <p>Every change checkpoint across all decisions, in one place.</p>
      </div>

      <div className="global-list-toolbar">
        <input
          type="text"
          className="global-list-search"
          placeholder="Search by decision title or who changed it..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="global-list-panel">
        {error && <p className="global-list-error">{error}</p>}

        {loading ? (
          <div className="global-list-empty">Loading version history...</div>
        ) : rows.length === 0 ? (
          <div className="global-list-empty">No versions match these filters.</div>
        ) : (
          <>
            <table className="global-list-table">
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Modified By</th>
                  <th>Change Summary</th>
                  <th>Modified</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link
                        to={`/dashboard/decisions/${v.decision_id}/versions`}
                        className="global-list-decision-link"
                      >
                        {v.title}
                      </Link>
                    </td>
                    <td>v{v.version_number}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>{v.modifier.full_name}</td>
                    <td>{v.change_summary || '—'}</td>
                    <td>{formatDateTime(v.modified_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default GlobalVersionHistory;
