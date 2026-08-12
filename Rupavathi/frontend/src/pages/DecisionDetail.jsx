import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canActOnApprovalLevel, APPROVAL_LEVEL_ROLE, APPROVAL_LEVEL_LABEL } from '../utils/permissions';
import { decisionAPI, approvalAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import './DecisionDetail.css';

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

function ApprovalLevelCard({ approval, canAct, isOwnDecision, onApprove, onReject, acting }) {
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [localError, setLocalError] = useState('');

  const handleReject = () => {
    if (!remarks.trim()) {
      setLocalError('Remarks are mandatory when rejecting.');
      return;
    }
    setLocalError('');
    onReject(approval.id, remarks.trim());
  };

  return (
    <div className="approval-card">
      <div className="approval-card-header">
        <span className="approval-card-level">{APPROVAL_LEVEL_LABEL[approval.approval_level]}</span>
        <StatusBadge status={approval.status} />
      </div>

      {approval.status !== 'Pending' && (
        <p className="approval-card-meta">
          {approval.status} by {approval.reviewer?.full_name || 'Unknown'} on {formatDate(approval.approved_at)}
        </p>
      )}

      {approval.remarks && <p className="approval-card-remarks">"{approval.remarks}"</p>}

      {approval.status === 'Pending' && (
        <>
          {isOwnDecision ? (
            <p className="approval-card-note">You cannot act on your own decision.</p>
          ) : !canAct ? (
            <p className="approval-card-note">
              Only an {APPROVAL_LEVEL_ROLE[approval.approval_level]} or Admin can act on this.
            </p>
          ) : (
            <div className="approval-card-actions">
              {localError && <p className="approval-card-error">{localError}</p>}
              {showRejectBox ? (
                <div className="approval-reject-box">
                  <textarea
                    rows={2}
                    placeholder="Remarks (required to reject)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div className="approval-reject-box-actions">
                    <button
                      type="button"
                      className="decision-action-btn decision-action-reject"
                      onClick={handleReject}
                      disabled={acting}
                    >
                      Confirm Reject
                    </button>
                    <button
                      type="button"
                      className="decision-action-btn decision-action-edit"
                      onClick={() => {
                        setShowRejectBox(false);
                        setLocalError('');
                      }}
                      disabled={acting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="decision-action-btn decision-action-approve"
                    onClick={() => onApprove(approval.id)}
                    disabled={acting}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="decision-action-btn decision-action-reject"
                    onClick={() => setShowRejectBox(true)}
                    disabled={acting}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [decision, setDecision] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actingApprovalId, setActingApprovalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDecision = () => {
    setLoading(true);
    Promise.all([decisionAPI.get(id), decisionAPI.approvals(id)])
      .then(([decisionRes, approvalsRes]) => {
        setDecision(decisionRes.data);
        setApprovals(approvalsRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this decision.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadDecision, [id]);

  const handleSubmitForReview = async () => {
    setUpdating(true);
    setError('');
    try {
      const { data } = await decisionAPI.update(id, { status: 'Under Review' });
      setDecision(data);
      const { data: approvalsData } = await decisionAPI.approvals(id);
      setApprovals(approvalsData);
      showToast('Decision submitted for review!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not submit decision for review.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async (approvalId) => {
    setActingApprovalId(approvalId);
    setError('');
    try {
      await approvalAPI.approve(approvalId, null);
      loadDecision();
      showToast('Approved successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not approve.'));
    } finally {
      setActingApprovalId(null);
    }
  };

  const handleReject = async (approvalId, remarks) => {
    setActingApprovalId(approvalId);
    setError('');
    try {
      await approvalAPI.reject(approvalId, remarks);
      loadDecision();
      showToast('Rejected successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not reject.'));
    } finally {
      setActingApprovalId(null);
    }
  };

  const handleDeleteDecision = async () => {
    if (!window.confirm(`Delete "${decision.title}" permanently? This cannot be undone.`)) return;

    setDeleting(true);
    setError('');
    try {
      await decisionAPI.remove(id);
      showToast('Decision deleted successfully!', 'success');
      navigate('/dashboard/decisions');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete this decision.'));
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="decision-detail">Loading decision...</div>;
  }

  if (error && !decision) {
    return (
      <div className="decision-detail">
        <p>{error}</p>
        <BackButton to="/dashboard/decisions">Back to Decisions</BackButton>
      </div>
    );
  }

  if (!decision) return null;

  const isOwnDecision = decision.created_by === user?.id;
  const canSubmitForReview = decision.status === 'Draft' && (isOwnDecision || user?.role === 'Admin');

  return (
    <div className="decision-detail">
      <BackButton to="/dashboard/decisions">Back to Decisions</BackButton>

      <div className="decision-detail-header">
        <div className="decision-detail-header-text">
          <p className="decision-detail-id">{decision.category.name}</p>
          <h1>{decision.title}</h1>
          <div className="decision-detail-meta">
            <span>Created by {decision.creator.full_name}</span>
            <span className="decision-detail-dot">&middot;</span>
            <span>Created {formatDate(decision.created_at)}</span>
          </div>
        </div>
        <StatusBadge status={decision.status} />
      </div>

      {error && <p style={{ color: '#c0392b', fontSize: '13.5px' }}>{error}</p>}

      <div className="decision-detail-actions">
        {canSubmitForReview && (
          <button
            type="button"
            className="decision-action-btn decision-action-approve"
            onClick={handleSubmitForReview}
            disabled={updating}
          >
            {updating ? 'Submitting...' : 'Submit for Review'}
          </button>
        )}
        <button
          type="button"
          className="decision-action-btn decision-action-edit"
          onClick={() => navigate(`/dashboard/decisions/${id}/edit`)}
        >
          Edit Decision
        </button>
        <button
          type="button"
          className="decision-action-btn decision-action-edit"
          onClick={() => navigate(`/dashboard/decisions/${id}/alternatives`)}
        >
          View Alternatives
        </button>
        <button
          type="button"
          className="decision-action-btn decision-action-edit"
          onClick={() => navigate(`/dashboard/decisions/${id}/documents`)}
        >
          View Documents
        </button>
        <button
          type="button"
          className="decision-action-btn decision-action-edit"
          onClick={() => navigate(`/dashboard/decisions/${id}/discussion`)}
        >
          View Discussion
        </button>
        <button
          type="button"
          className="decision-action-btn decision-action-edit"
          onClick={() => navigate(`/dashboard/decisions/${id}/versions`)}
        >
          View History
        </button>
      </div>

      {approvals.length > 0 && (
        <div className="decision-detail-panel">
          <h2>Approval Workflow</h2>
          <div className="approval-cards">
            {approvals
              .slice()
              .sort((a, b) => a.approval_level - b.approval_level)
              .map((approval) => (
                <ApprovalLevelCard
                  key={approval.id}
                  approval={approval}
                  canAct={canActOnApprovalLevel(user?.role, approval.approval_level)}
                  isOwnDecision={isOwnDecision}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  acting={actingApprovalId === approval.id}
                />
              ))}
          </div>
        </div>
      )}

      <div className="decision-detail-grid">
        <div className="decision-detail-panel">
          <h2>Problem Statement</h2>
          <p>{decision.problem_statement}</p>
        </div>

        <div className="decision-detail-panel">
          <h2>Description</h2>
          <p>{decision.description || 'No additional description has been added for this decision.'}</p>
        </div>
      </div>

      {(isOwnDecision || user?.role === 'Admin') && (
        <div className="decision-detail-panel decision-detail-danger-panel">
          <h2>Danger Zone</h2>
          <p className="decision-detail-danger-text">
            Deleting this decision is permanent and also removes its alternatives, documents,
            comments, and approval history.
          </p>
          <button
            type="button"
            className="decision-action-btn decision-action-delete"
            onClick={handleDeleteDecision}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Decision'}
          </button>
        </div>
      )}
    </div>
  );
}

export default DecisionDetail;
