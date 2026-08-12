import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { approvalAPI, extractErrorMessage } from '../services/api';
import { APPROVAL_LEVEL_LABEL } from '../utils/permissions';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './ApprovalHistory.css';

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

function ApprovalHistory() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    approvalAPI
      .list()
      .then(({ data }) => setApprovals(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load approval history.')))
      .finally(() => setLoading(false));
  }, []);

  const resolved = approvals
    .filter((a) => a.status !== 'Pending')
    .sort((a, b) => new Date(b.approved_at) - new Date(a.approved_at));

  return (
    <div className="approval-history-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="approval-history-page-header">
        <h1>Approval History</h1>
        <p>A record of every approval and rejection across all decisions.</p>
      </div>

      <div className="approval-history-panel">
        {error && <p className="approval-history-error">{error}</p>}

        {loading ? (
          <div className="approval-history-empty">Loading approval history...</div>
        ) : resolved.length === 0 ? (
          <div className="approval-history-empty">No approvals or rejections have been recorded yet.</div>
        ) : (
          <table className="approval-history-table">
            <thead>
              <tr>
                <th>Decision Title</th>
                <th>Level</th>
                <th>Status</th>
                <th>Acted By</th>
                <th>Remarks</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((approval) => (
                <tr key={approval.id}>
                  <td>
                    <Link to={`/dashboard/approvals/${approval.id}`} className="approval-history-title">
                      {approval.decision.title}
                    </Link>
                  </td>
                  <td>{APPROVAL_LEVEL_LABEL[approval.approval_level]}</td>
                  <td>
                    <StatusBadge status={approval.status} />
                  </td>
                  <td>{approval.reviewer?.full_name || '—'}</td>
                  <td className="approval-history-remarks">{approval.remarks || '—'}</td>
                  <td>{formatDateTime(approval.approved_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ApprovalHistory;
