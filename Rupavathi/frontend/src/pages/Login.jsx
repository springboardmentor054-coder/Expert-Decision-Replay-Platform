import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_SERVICES_ID = import.meta.env.VITE_APPLE_SERVICES_ID;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;
const APPLE_SDK_URL =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

const FEATURES = [
  {
    id: 'secure-access',
    title: 'Secure Access',
    description: 'Your data and decisions are protected',
    icon: (
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
    ),
  },
  {
    id: 'create-decisions',
    title: 'Create Decisions',
    description: 'Capture and document important decisions',
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    id: 'review-decisions',
    title: 'Review Decisions',
    description: 'Evaluate and provide feedback with ease',
    icon: (
      <>
        <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M9 3a2 2 0 002 2h2a2 2 0 002-2M9 3a2 2 0 012-2h2a2 2 0 012 2m0 0h4a2 2 0 012 2v6" />
        <path d="M9 12h6M9 16h4" />
      </>
    ),
  },
  {
    id: 'track-status',
    title: 'Track Decision Status',
    description: 'Monitor progress and stay informed',
    icon: (
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M21 7v6h-6" />
      </>
    ),
  },
  {
    id: 'collaborate',
    title: 'Collaborate with Your Team',
    description: 'Work together and make better decisions',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
];

const GoogleIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 01-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3a7.4 7.4 0 01-4.05 1.15c-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09A12 12 0 0012 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.31 14.32a7.2 7.2 0 010-4.64V6.59H1.3a12 12 0 000 10.82l4.01-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 001.3 6.59l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
    />
  </svg>
);

// Isolated so useGoogleLogin's SDK init only runs when this mounts — i.e.
// only when a real Client ID is configured. Calling the hook unconditionally
// in Login itself would crash on mount whenever VITE_GOOGLE_CLIENT_ID is unset.
function GoogleSignInButton({ onSuccess, onError }) {
  const googleLogin = useGoogleLogin({ onSuccess, onError });

  return (
    <button type="button" className="social-btn" onClick={() => googleLogin()}>
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { showToast } = useToast();
  const { defaultLandingPage } = usePreferences();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const result = await login(email.trim(), password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    showToast('Login successful!', 'success');
    navigate(defaultLandingPage);
  };

  const finishSocialLogin = (result, provider) => {
    if (!result.success) {
      setError(result.message);
      return;
    }
    showToast(
      result.isNewUser ? `Account created with ${provider}!` : 'Login successful!',
      'success'
    );
    navigate(defaultLandingPage);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError('');
    const result = await loginWithGoogle(tokenResponse.access_token);
    finishSocialLogin(result, 'Google');
  };

  const handleGoogleError = () => setError('Google sign-in was cancelled or failed.');

  useEffect(() => {
    if (!APPLE_SERVICES_ID || !APPLE_REDIRECT_URI) return;
    if (document.getElementById('apple-signin-sdk')) return;

    const script = document.createElement('script');
    script.id = 'apple-signin-sdk';
    script.src = APPLE_SDK_URL;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: APPLE_SERVICES_ID,
        scope: 'name email',
        redirectURI: APPLE_REDIRECT_URI,
        usePopup: true,
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleAppleButtonClick = async () => {
    if (!APPLE_SERVICES_ID || !APPLE_REDIRECT_URI || !window.AppleID) {
      setError("Apple sign-in isn't set up yet. Please use your email and password.");
      return;
    }

    setError('');
    try {
      const response = await window.AppleID.auth.signIn();
      const idToken = response.authorization?.id_token;
      const fullName = response.user?.name
        ? `${response.user.name.firstName || ''} ${response.user.name.lastName || ''}`.trim()
        : undefined;
      const result = await loginWithApple(idToken, fullName || undefined);
      finishSocialLogin(result, 'Apple');
    } catch (err) {
      if (err?.error === 'popup_closed_by_user') return;
      setError('Apple sign-in failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* ================= LEFT PANEL ================= */}
        <aside className="welcome-panel" aria-hidden="false">
          <div className="deco-circle" />
          <div className="deco-dots" />
          <svg
            className="deco-leaf"
            viewBox="0 0 70 110"
            fill="none"
            stroke="rgba(216,176,122,0.4)"
            strokeWidth="1.5"
          >
            <path d="M35 5 C55 25 60 60 35 105 C10 60 15 25 35 5Z" />
            <path d="M35 5 L35 105" strokeDasharray="2 3" />
          </svg>

          <div className="brand">
            <div className="hex-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D8B07A" strokeWidth="1.6">
                <path d="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <p className="brand-name">EDRP</p>
              <p className="brand-sub">
                Expert Decision
                <br />
                Replay Platform
              </p>
            </div>
          </div>

          <h1 className="headline">
            Welcome to your <span className="gold">workspace.</span>
          </h1>
          <div className="underline" />

          <ul className="feature-list">
            {FEATURES.map((feature) => (
              <li className="feature" key={feature.id}>
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                    {feature.icon}
                  </svg>
                </div>
                <div>
                  <p className="feature-title">{feature.title}</p>
                  <p className="feature-desc">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="panel-footer">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            <span>Secure. Reliable. Always with you.</span>
          </div>
        </aside>

        {/* ================= RIGHT PANEL ================= */}
        <main className="form-panel">
          <div className="lang-select">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />
            </svg>
            <span>English</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <div className="login-card">
            <h2>Sign In</h2>
            <p className="subtitle">Access your workspace securely</p>

            {justRegistered && !error && (
              <p
                style={{
                  color: '#173528',
                  background: 'rgba(23, 53, 40, 0.06)',
                  fontSize: '13px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              >
                Account created successfully. Please sign in.
              </p>
            )}

            {error && (
              <p
                style={{
                  color: '#c0392b',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <div className="input-wrap">
                  <svg className="leading-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 6l10 7 10-7" />
                  </svg>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <svg className="leading-icon" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-eye"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="row-between">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn-signin">
                Sign In
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-buttons">
              {GOOGLE_CLIENT_ID ? (
                <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              ) : (
                <button
                  type="button"
                  className="social-btn"
                  onClick={() =>
                    setError("Google sign-in isn't set up yet. Please use your email and password.")
                  }
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              )}
              <button
                type="button"
                className="social-btn"
                onClick={handleAppleButtonClick}
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.417 2.25-1.24 3.146-.898.94-2.13 1.65-3.31 1.56-.14-1.17.42-2.4 1.24-3.24C13.9 1.85 15.24 1.2 16.365 1.43zM20.32 17.14c-.532 1.21-.79 1.76-1.48 2.83-.96 1.49-2.31 3.35-3.99 3.37-1.49.02-1.87-.97-3.89-.96-2.02.01-2.44.98-3.93.96-1.68-.02-2.96-1.69-3.92-3.18C1.03 16.66.44 12.5 2.16 9.66c1.03-1.72 2.87-2.8 4.85-2.83 1.55-.03 3.01 1.04 3.96 1.04.94 0 2.72-1.29 4.58-1.1.78.03 2.97.32 4.38 2.4-.12.07-2.62 1.53-2.59 4.56.03 3.62 3.18 4.82 3.22 4.83-.03.08-.5 1.72-1.24 3.38z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            <p className="bottom-text">
              New to the platform? <Link to="/register">Create account</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;