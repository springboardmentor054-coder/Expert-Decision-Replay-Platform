import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { approvalAPI, extractErrorMessage } from '../services/api';
import { canActOnApprovalLevel, APPROVAL_LEVEL_LABEL, APPROVAL_LEVEL_ROLE } from '../utils/permissions';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './ApprovalDetail.css';

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ApprovalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [remarks, setRemarks] = useState('');

  const load = () => {
    setLoading(true);
    approvalAPI
      .get(id)
      .then(({ data }) => setApproval(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this approval.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleApprove = async () => {
    setActing(true);
    setError('');
    try {
      await approvalAPI.approve(id, null);
      load();
      showToast('Approved successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not approve.'));
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      setError('Remarks are mandatory when rejecting.');
      return;
    }
    setActing(true);
    setError('');
    try {
      await approvalAPI.reject(id, remarks.trim());
      setShowRejectBox(false);
      load();
      showToast('Rejected successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not reject.'));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <div className="approval-detail">Loading approval...</div>;
  }

  if (error && !approval) {
    return (
      <div className="approval-detail">
        <p>{error}</p>
        <BackButton to="/dashboard/approvals">Back to Pending Approvals</BackButton>
      </div>
    );
  }

  if (!approval) return null;

  const decision = approval.decision;
  const isOwnDecision = decision.created_by === user?.id;
  const canAct = canActOnApprovalLevel(user?.role, approval.approval_level);

  return (
    <div className="approval-detail">
      <BackButton to="/dashboard/approvals">Back to Pending Approvals</BackButton>

      <div className="approval-detail-header">
        <div className="approval-detail-header-text">
          <p className="approval-detail-level">{APPROVAL_LEVEL_LABEL[approval.approval_level]}</p>
          <h1>{decision.title}</h1>
          <div className="approval-detail-meta">
            <span>Submitted by {decision.creator.full_name}</span>
            <span className="approval-detail-dot">&middot;</span>
            <span>Decision status: {decision.status}</span>
          </div>
        </div>
        <StatusBadge status={approval.status} />
      </div>

      {error && <p className="approval-detail-error">{error}</p>}

      <div className="approval-detail-panel">
        <h2>Remarks</h2>
        <p>{approval.remarks || 'No remarks recorded yet.'}</p>
      </div>

      {approval.status !== 'Pending' && (
        <div className="approval-detail-panel">
          <h2>Resolution</h2>
          <p>
            {approval.status} by {approval.reviewer?.full_name || 'Unknown'} on {formatDate(approval.approved_at)}
          </p>
        </div>
      )}

      {approval.status === 'Pending' && (
        <div className="approval-detail-panel">
          <h2>Take Action</h2>

          {isOwnDecision ? (
            <p className="approval-detail-note">You cannot approve or reject your own decision.</p>
          ) : !canAct ? (
            <p className="approval-detail-note">
              Only an {APPROVAL_LEVEL_ROLE[approval.approval_level]} or Admin can act on this.
            </p>
          ) : showRejectBox ? (
            <div className="approval-reject-box">
              <textarea
                rows={3}
                placeholder="Remarks (required to reject)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div className="approval-detail-actions">
                <button
                  type="button"
                  className="approval-btn approval-btn-reject"
                  onClick={handleReject}
                  disabled={acting}
                >
                  Confirm Reject
                </button>
                <button
                  type="button"
                  className="approval-btn approval-btn-secondary"
                  onClick={() => setShowRejectBox(false)}
                  disabled={acting}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="approval-detail-actions">
              <button
                type="button"
                className="approval-btn approval-btn-approve"
                onClick={handleApprove}
                disabled={acting}
              >
                Approve
              </button>
              <button
                type="button"
                className="approval-btn approval-btn-reject"
                onClick={() => setShowRejectBox(true)}
                disabled={acting}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      <Link to={`/dashboard/decisions/${decision.id}`} className="approval-detail-view-decision">
        View Full Decision &rarr;
      </Link>
    </div>
  );
}

export default ApprovalDetail;
