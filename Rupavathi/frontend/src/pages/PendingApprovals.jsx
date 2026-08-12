import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { approvalAPI, extractErrorMessage } from '../services/api';
import { canActOnApprovalLevel, APPROVAL_LEVEL_LABEL } from '../utils/permissions';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './PendingApprovals.css';

function PendingApprovals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    approvalAPI
      .list()
      .then(({ data }) => setApprovals(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load pending approvals.')))
      .finally(() => setLoading(false));
  }, []);

  const pendingForMe = approvals.filter(
    (a) =>
      a.status === 'Pending' &&
      canActOnApprovalLevel(user?.role, a.approval_level) &&
      a.decision.created_by !== user?.id
  );

  return (
    <div className="pending-approvals-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="pending-approvals-page-header">
        <h1>Pending Approvals</h1>
        <p>Decisions awaiting your review or approval.</p>
      </div>

      <div className="pending-approvals-panel">
        {error && <p className="pending-approvals-error">{error}</p>}

        {loading ? (
          <div className="pending-approvals-empty">Loading pending approvals...</div>
        ) : pendingForMe.length === 0 ? (
          <div className="pending-approvals-empty">Nothing pending your action right now.</div>
        ) : (
          <table className="pending-approvals-table">
            <thead>
              <tr>
                <th>Decision Title</th>
                <th>Submitted By</th>
                <th>Level</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingForMe.map((approval) => (
                <tr key={approval.id}>
                  <td className="pending-approvals-title">{approval.decision.title}</td>
                  <td>{approval.decision.creator.full_name}</td>
                  <td>{APPROVAL_LEVEL_LABEL[approval.approval_level]}</td>
                  <td>
                    <StatusBadge status={approval.status} />
                  </td>
                  <td>
                    <Link to={`/dashboard/approvals/${approval.id}`} className="pending-approvals-link">
                      Review
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

export default PendingApprovals;
