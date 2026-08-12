import './StatCard.css';

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${accent ? 'stat-card-icon-accent' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
          {icon}
        </svg>
      </div>
      <div>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;