import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryAPI, decisionAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import DecisionForm from '../components/DecisionForm';
import BackButton from '../components/BackButton';
import './DecisionList.css';

function DecisionEdit() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([categoryAPI.list(), decisionAPI.get(id)])
      .then(([categoriesRes, decisionRes]) => {
        if (cancelled) return;
        setCategories(categoriesRes.data);
        setDecision(decisionRes.data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(extractErrorMessage(err, 'Could not load this decision.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      await decisionAPI.update(id, payload);
      showToast('Decision updated successfully!', 'success');
      navigate(`/dashboard/decisions/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not update decision. Please try again.'));
    }
  };

  return (
    <div className="decisions-page">
      <div className="decisions-page-header">
        <div>
          <h1>Edit Decision</h1>
          <p>Update the details of this decision.</p>
        </div>
      </div>

      <div className="decisions-panel">
        {loading ? (
          <div className="decisions-loading">Loading decision...</div>
        ) : loadError ? (
          <p className="decisions-form-error">{loadError}</p>
        ) : (
          <DecisionForm
            categories={categories}
            initialValues={decision}
            showStatus
            submitLabel="Save Changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/dashboard/decisions/${id}`)}
          />
        )}
      </div>

      <BackButton to="/dashboard/decisions">Back to Decisions</BackButton>
    </div>
  );
}

export default DecisionEdit;
