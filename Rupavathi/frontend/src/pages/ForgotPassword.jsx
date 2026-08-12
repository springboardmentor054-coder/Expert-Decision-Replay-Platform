import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // TEMPORARY: no real email is sent. Step 15 will replace this
    // with a real POST /forgot-password API call to the backend.
    setSubmitted(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {submitted ? (
          <>
            <h2>Check your email</h2>
            <p className="auth-subtitle">
              If an account exists for <strong>{email}</strong>, we've sent
              password reset instructions.
            </p>
            <Link to="/login" className="auth-submit-btn auth-back-btn">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h2>Reset your password</h2>
            <p className="auth-subtitle">
              Enter your email and we'll send you reset instructions.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <button type="submit" className="auth-submit-btn">
                Send reset link
              </button>
            </form>

            <p className="auth-bottom-text">
              Remembered your password? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;