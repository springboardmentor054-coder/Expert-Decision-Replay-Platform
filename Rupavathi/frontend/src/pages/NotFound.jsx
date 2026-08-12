import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Page not found</h1>
      <p style={{ color: '#777777', marginBottom: '24px' }}>
        The page you're looking for doesn't exist yet.
      </p>
      <Link
        to="/login"
        style={{
          color: '#173528',
          fontWeight: 600,
          textDecoration: 'underline',
        }}
      >
        Go back to Sign In
      </Link>
    </div>
  );
}

export default NotFound;