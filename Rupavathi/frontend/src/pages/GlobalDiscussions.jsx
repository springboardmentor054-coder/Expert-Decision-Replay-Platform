import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { commentAPI, extractErrorMessage } from '../services/api';
import BackButton from '../components/BackButton';
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

function truncate(text, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function GlobalDiscussions() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    commentAPI
      .listAll()
      .then(({ data }) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setComments(sorted);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load discussions.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return comments;
    return comments.filter(
      (c) =>
        c.comment.toLowerCase().includes(term) ||
        c.decision.title.toLowerCase().includes(term) ||
        c.author.full_name.toLowerCase().includes(term)
    );
  }, [comments, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="global-list-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="global-list-header">
        <h1>Discussions</h1>
        <p>Every comment left across all decisions, in one place.</p>
      </div>

      <div className="global-list-toolbar">
        <input
          type="text"
          className="global-list-search"
          placeholder="Search comments, decisions, or authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="global-list-panel">
        {error && <p className="global-list-error">{error}</p>}

        {loading ? (
          <div className="global-list-empty">Loading discussions...</div>
        ) : rows.length === 0 ? (
          <div className="global-list-empty">No discussions match these filters.</div>
        ) : (
          <>
            <table className="global-list-table">
              <thead>
                <tr>
                  <th>Comment</th>
                  <th>Decision</th>
                  <th>Author</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((c) => (
                  <tr key={c.id}>
                    <td>{truncate(c.comment)}</td>
                    <td>
                      <Link
                        to={`/dashboard/decisions/${c.decision_id}/discussion`}
                        className="global-list-decision-link"
                      >
                        {c.decision.title}
                      </Link>
                    </td>
                    <td>{c.author.full_name}</td>
                    <td>{formatDateTime(c.created_at)}</td>
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

export default GlobalDiscussions;
