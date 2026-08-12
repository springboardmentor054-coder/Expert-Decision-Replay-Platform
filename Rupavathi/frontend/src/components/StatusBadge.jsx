import './StatusBadge.css';

function StatusBadge({ status }) {
  const statusClass = `status-badge status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`;

  return <span className={statusClass}>{status}</span>;
}

export default StatusBadge;