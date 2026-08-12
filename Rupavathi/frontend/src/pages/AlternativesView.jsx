import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { alternativeAPI, decisionAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './AlternativesView.css';

function formatCost(cost) {
  if (cost == null) return '—';
  return `$${Number(cost).toLocaleString()}`;
}

function AlternativesView() {
  const { decisionId } = useParams();
  const [decision, setDecision] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([decisionAPI.get(decisionId), alternativeAPI.listForDecision(decisionId)])
      .then(([decisionRes, alternativesRes]) => {
        if (cancelled) return;
        setDecision(decisionRes.data);
        setAlternatives(alternativesRes.data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load alternatives.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [decisionId]);

  return (
    <div className="alternatives-page">
      <BackButton to={`/dashboard/decisions/${decisionId}`}>Back to Decision</BackButton>

      <div className="alternatives-page-header">
        <div>
          <h1>Alternatives{decision ? ` for "${decision.title}"` : ''}</h1>
          <p>Every alternative recorded here belongs to this decision.</p>
        </div>
        <div className="alternatives-page-actions">
          <Link to={`/dashboard/decisions/${decisionId}/alternatives/compare`} className="alternatives-btn alternatives-btn-secondary">
            Compare Alternatives
          </Link>
          <Link to={`/dashboard/decisions/${decisionId}/alternatives/new`} className="alternatives-btn alternatives-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Alternative
          </Link>
        </div>
      </div>

      <div className="alternatives-panel">
        {error && <p className="alternatives-form-error">{error}</p>}

        {loading ? (
          <div className="alternatives-loading">Loading alternatives...</div>
        ) : alternatives.length === 0 ? (
          <div className="alternatives-empty">
            No alternatives recorded yet. Add one to start comparing options.
          </div>
        ) : (
          <table className="alternatives-table">
            <thead>
              <tr>
                <th>Alternative Name</th>
                <th>Cost</th>
                <th>Feasibility</th>
                <th>Risk Level</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alternatives.map((alt) => (
                <tr key={alt.id}>
                  <td className="alternatives-table-name">{alt.alternative_name}</td>
                  <td>{formatCost(alt.estimated_cost)}</td>
                  <td>{alt.feasibility || '—'}</td>
                  <td>
                    <StatusBadge status={alt.risk_level} />
                  </td>
                  <td>
                    <Link
                      to={`/dashboard/decisions/${decisionId}/alternatives/${alt.id}/edit`}
                      className="alternatives-table-edit-link"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AlternativesView;
