import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { alternativeAPI, extractErrorMessage } from '../services/api';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';
import './GlobalList.css';

const RISK_LEVELS = ['Low', 'Medium', 'High'];
const PAGE_SIZE = 10;

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCost(cost) {
  if (cost == null) return '—';
  return `$${Number(cost).toLocaleString()}`;
}

function GlobalAlternatives() {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    alternativeAPI
      .listAll()
      .then(({ data }) => setAlternatives(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load alternatives.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, riskLevel]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return alternatives.filter((alt) => {
      const matchesSearch =
        !term ||
        alt.alternative_name.toLowerCase().includes(term) ||
        alt.decision.title.toLowerCase().includes(term);
      const matchesRisk = !riskLevel || alt.risk_level === riskLevel;
      return matchesSearch && matchesRisk;
    });
  }, [alternatives, search, riskLevel]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="global-list-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="global-list-header">
        <h1>Alternatives</h1>
        <p>Every proposed alternative across all decisions, in one place.</p>
      </div>

      <div className="global-list-toolbar">
        <input
          type="text"
          className="global-list-search"
          placeholder="Search by alternative or decision title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CustomSelect
          value={riskLevel}
          onChange={setRiskLevel}
          placeholder="All Risk Levels"
          options={[
            { value: '', label: 'All Risk Levels' },
            ...RISK_LEVELS.map((r) => ({ value: r, label: r })),
          ]}
        />
      </div>

      <div className="global-list-panel">
        {error && <p className="global-list-error">{error}</p>}

        {loading ? (
          <div className="global-list-empty">Loading alternatives...</div>
        ) : rows.length === 0 ? (
          <div className="global-list-empty">No alternatives match these filters.</div>
        ) : (
          <>
            <table className="global-list-table">
              <thead>
                <tr>
                  <th>Alternative</th>
                  <th>Decision</th>
                  <th>Risk Level</th>
                  <th>Estimated Cost</th>
                  <th>Feasibility</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((alt) => (
                  <tr key={alt.id}>
                    <td>{alt.alternative_name}</td>
                    <td>
                      <Link
                        to={`/dashboard/decisions/${alt.decision_id}`}
                        className="global-list-decision-link"
                      >
                        {alt.decision.title}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={alt.risk_level} />
                    </td>
                    <td>{formatCost(alt.estimated_cost)}</td>
                    <td>{alt.feasibility || '—'}</td>
                    <td>{formatDate(alt.created_at)}</td>
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

export default GlobalAlternatives;
