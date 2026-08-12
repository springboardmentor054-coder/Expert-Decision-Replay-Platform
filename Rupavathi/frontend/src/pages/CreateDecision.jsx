import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryAPI, decisionAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import DecisionForm from '../components/DecisionForm';
import BackButton from '../components/BackButton';
import './DecisionList.css';

function CreateDecision() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    categoryAPI
      .list()
      .then(({ data }) => setCategories(data))
      .catch((err) => setLoadError(extractErrorMessage(err, 'Could not load categories.')));
  }, []);

  const handleSubmit = async (payload) => {
    try {
      const { data } = await decisionAPI.create(payload);
      showToast('Decision created successfully!', 'success');
      navigate(`/dashboard/decisions/${data.id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not create decision. Please try again.'));
    }
  };

  return (
    <div className="decisions-page">
      <div className="decisions-page-header">
        <div>
          <h1>Create Decision</h1>
          <p>Record a new decision so it can be discussed, reviewed, and tracked.</p>
        </div>
      </div>

      <div className="decisions-panel">
        {loadError && <p className="decisions-form-error">{loadError}</p>}
        <DecisionForm
          categories={categories}
          showStatus={false}
          submitLabel="Create Decision"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/decisions')}
        />
      </div>

      <BackButton to="/dashboard/decisions">Back to Decisions</BackButton>
    </div>
  );
}

export default CreateDecision;
