import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { decisionAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import FilterTabs from '../components/FilterTabs';
import BackButton from '../components/BackButton';
import './DecisionList.css';

const STATUS_TABS = ['All', 'Draft', 'Under Review', 'Approved', 'Rejected'];

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DecisionList() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    let cancelled = false;

    decisionAPI
      .list()
      .then(({ data }) => {
        if (!cancelled) setDecisions(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load decisions.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDecisions = decisions.filter((decision) => {
    const matchesTab = activeTab === 'All' || decision.status === activeTab;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      decision.title.toLowerCase().includes(term) ||
      decision.category.name.toLowerCase().includes(term) ||
      decision.creator.full_name.toLowerCase().includes(term);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="decisions-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="decisions-page-header">
        <div>
          <h1>Decisions</h1>
          <p>Manage and track every decision made across your team.</p>
        </div>
        <Link to="/dashboard/decisions/new" className="new-decision-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Decision
        </Link>
      </div>

      <div className="decisions-toolbar">
        <FilterTabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="decisions-search">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, category, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="decisions-panel">
        {error && <p className="decisions-form-error">{error}</p>}

        <div className="decisions-full-table">
          <div className="decisions-full-table-head">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Created By</span>
            <span>Created Date</span>
            <span></span>
          </div>

          {loading ? (
            <div className="decisions-loading">Loading decisions...</div>
          ) : filteredDecisions.length === 0 ? (
            <div className="decisions-empty">No decisions match your search or filter.</div>
          ) : (
            filteredDecisions.map((decision) => (
              <div className="decisions-full-table-row" key={decision.id}>
                <Link to={`/dashboard/decisions/${decision.id}`} className="decisions-table-title">
                  {decision.title}
                </Link>
                <span>{decision.category.name}</span>
                <span>
                  <StatusBadge status={decision.status} />
                </span>
                <span>{decision.creator.full_name}</span>
                <span>{formatDate(decision.created_at)}</span>
                <Link to={`/dashboard/decisions/${decision.id}/edit`} className="decisions-table-edit-link">
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DecisionList;
