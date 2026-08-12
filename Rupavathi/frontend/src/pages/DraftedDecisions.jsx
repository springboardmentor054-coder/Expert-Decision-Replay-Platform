import BackButton from '../components/BackButton';

function DraftedDecisions() {
  return (
    <div>
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#222222', marginTop: '16px' }}>
        Drafted Decisions
      </h1>
      <p style={{ color: '#777777', marginTop: '8px' }}>
        Unfinished, saved-as-draft decisions will appear here.
      </p>
    </div>
  );
}

export default DraftedDecisions;
