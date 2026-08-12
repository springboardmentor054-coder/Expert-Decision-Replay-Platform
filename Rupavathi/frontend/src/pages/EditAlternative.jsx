import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alternativeAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import AlternativeForm from '../components/AlternativeForm';
import BackButton from '../components/BackButton';
import './AlternativesView.css';

function EditAlternative() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { decisionId, altId } = useParams();
  const [alternative, setAlternative] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    alternativeAPI
      .get(altId)
      .then(({ data }) => {
        if (!cancelled) setAlternative(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(extractErrorMessage(err, 'Could not load this alternative.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [altId]);

  const handleSubmit = async (payload) => {
    try {
      await alternativeAPI.update(altId, payload);
      showToast('Alternative updated successfully!', 'success');
      navigate(`/dashboard/decisions/${decisionId}/alternatives`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not update alternative. Please try again.'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this alternative? This cannot be undone.')) return;
    try {
      await alternativeAPI.remove(altId);
      showToast('Alternative deleted successfully!', 'success');
      navigate(`/dashboard/decisions/${decisionId}/alternatives`);
    } catch (error) {
      setLoadError(extractErrorMessage(error, 'Could not delete alternative.'));
    }
  };

  return (
    <div className="alternatives-page">
      <div className="alternatives-page-header">
        <div>
          <h1>Edit Alternative</h1>
          <p>Update the details of this alternative.</p>
        </div>
        {alternative && (
          <button type="button" className="alternatives-btn alternatives-btn-secondary" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      <div className="alternatives-panel">
        {loading ? (
          <div className="alternatives-loading">Loading alternative...</div>
        ) : loadError && !alternative ? (
          <p className="alternatives-form-error">{loadError}</p>
        ) : (
          <>
            {loadError && <p className="alternatives-form-error">{loadError}</p>}
            <AlternativeForm
              initialValues={alternative}
              submitLabel="Save Changes"
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/dashboard/decisions/${decisionId}/alternatives`)}
            />
          </>
        )}
      </div>

      <BackButton to={`/dashboard/decisions/${decisionId}/alternatives`}>Back to Alternatives</BackButton>
    </div>
  );
}

export default EditAlternative;
