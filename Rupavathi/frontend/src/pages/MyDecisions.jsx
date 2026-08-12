import BackButton from '../components/BackButton';

function MyDecisions() {
  return (
    <div>
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#222222', marginTop: '16px' }}>
        My Decisions
      </h1>
      <p style={{ color: '#777777', marginTop: '8px' }}>
        Decisions you've personally created will appear here.
      </p>
    </div>
  );
}

export default MyDecisions;
