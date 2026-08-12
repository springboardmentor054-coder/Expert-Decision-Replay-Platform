import { Link } from 'react-router-dom';
import './BackButton.css';

function BackButton({ to, children }) {
  return (
    <Link to={to} className="back-button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {children}
    </Link>
  );
}

export default BackButton;
