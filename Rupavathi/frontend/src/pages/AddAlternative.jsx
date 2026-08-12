import { useNavigate, useParams } from 'react-router-dom';
import { alternativeAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import AlternativeForm from '../components/AlternativeForm';
import BackButton from '../components/BackButton';
import './AlternativesView.css';

function AddAlternative() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { decisionId } = useParams();

  const handleSubmit = async (payload) => {
    try {
      await alternativeAPI.create({ ...payload, decision_id: Number(decisionId) });
      showToast('Alternative added successfully!', 'success');
      navigate(`/dashboard/decisions/${decisionId}/alternatives`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Could not create alternative. Please try again.'));
    }
  };

  return (
    <div className="alternatives-page">
      <div className="alternatives-page-header">
        <div>
          <h1>Add Alternative</h1>
          <p>Record a candidate solution for this decision.</p>
        </div>
      </div>

      <div className="alternatives-panel">
        <AlternativeForm
          submitLabel="Add Alternative"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/dashboard/decisions/${decisionId}/alternatives`)}
        />
      </div>

      <BackButton to={`/dashboard/decisions/${decisionId}/alternatives`}>Back to Alternatives</BackButton>
    </div>
  );
}

export default AddAlternative;
