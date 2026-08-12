import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { alternativeAPI, decisionAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './AlternativesView.css';

function formatCost(cost) {
  if (cost == null) return '—';
  return `$${Number(cost).toLocaleString()}`;
}

const ROWS = [
  { key: 'description', label: 'Description' },
  { key: 'pros', label: 'Pros' },
  { key: 'cons', label: 'Cons' },
  { key: 'estimated_cost', label: 'Cost', render: formatCost },
  { key: 'feasibility', label: 'Feasibility' },
  {
    key: 'risk_level',
    label: 'Risk Level',
    render: (value) => <StatusBadge status={value} />,
  },
];

function AlternativesCompare() {
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
      <BackButton to={`/dashboard/decisions/${decisionId}/alternatives`}>Back to Alternatives</BackButton>

      <div className="alternatives-page-header">
        <div>
          <h1>Compare Alternatives{decision ? ` for "${decision.title}"` : ''}</h1>
          <p>Side-by-side comparison to help choose the best option.</p>
        </div>
      </div>

      <div className="alternatives-panel">
        {error && <p className="alternatives-form-error">{error}</p>}

        {loading ? (
          <div className="alternatives-loading">Loading alternatives...</div>
        ) : alternatives.length === 0 ? (
          <div className="alternatives-empty">
            No alternatives recorded yet for this decision. Add at least one to compare.
          </div>
        ) : (
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-row-label">Alternative</th>
                {alternatives.map((alt) => (
                  <th key={alt.id} className="compare-alt-name">
                    {alt.alternative_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="compare-row-label">{row.label}</td>
                  {alternatives.map((alt) => (
                    <td key={alt.id}>
                      {row.render
                        ? row.render(alt[row.key])
                        : alt[row.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AlternativesCompare;
