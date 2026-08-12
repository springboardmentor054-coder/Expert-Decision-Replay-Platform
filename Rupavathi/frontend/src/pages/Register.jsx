import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Register.css';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Decision Reviewer', label: 'Decision Reviewer' },
  { value: 'Approver', label: 'Approver' },
  { value: 'Team Member', label: 'Team Member' },
  { value: 'User', label: 'User' },
];

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'One number (0-9)', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'One special character (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function getPasswordChecks(password) {
  return PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }));
}

function getPasswordStrength(checks) {
  const metCount = checks.filter((c) => c.met).length;
  if (metCount <= 2) return { level: 'weak', label: 'Weak' };
  if (metCount <= 4) return { level: 'medium', label: 'Medium' };
  return { level: 'strong', label: 'Strong' };
}

function PasswordStrengthMeter({ password }) {
  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(checks);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className={`password-strength-bar password-strength-bar-${strength.level}`}>
        <span />
        <span />
        <span />
      </div>
      <p className={`password-strength-label password-strength-label-${strength.level}`}>
        {strength.label} password
      </p>
      <ul className="password-rules">
        {checks.map((check) => (
          <li key={check.key} className={check.met ? 'password-rule-met' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              {check.met ? <path d="M20 6L9 17l-5-5" /> : <circle cx="12" cy="12" r="9" />}
            </svg>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a18.6 18.6 0 015.06-5.94M9.9 4.24A10.9 10.9 0 0112 4c7 0 11 7 11 7a18.6 18.6 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function RoleDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="role-dropdown" ref={containerRef}>
      <button
        type="button"
        className={
          open ? 'role-dropdown-trigger role-dropdown-trigger-open' : 'role-dropdown-trigger'
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selected ? 'role-dropdown-value' : 'role-dropdown-placeholder'}>
          {selected ? selected.label : 'Select your role'}
        </span>
        <svg
          className="role-dropdown-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="role-dropdown-menu" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              className={
                value === option.value
                  ? 'role-dropdown-option role-dropdown-option-selected'
                  : 'role-dropdown-option'
              }
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!role) {
      setError('Please select your role.');
      return;
    }

    const passwordChecks = getPasswordChecks(password);
    if (passwordChecks.some((check) => !check.met)) {
      setError('Password does not meet all the strength requirements below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await register(name.trim(), email.trim(), password, role);

    if (!result.success) {
      setError(result.message);
      return;
    }

    showToast('Account registered successfully!', 'success');
    navigate('/login?registered=true');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join your team's workspace on EDRP</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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

          <div className="auth-field">
            <label id="role-label">Role</label>
            <RoleDropdown value={role} onChange={setRole} options={ROLE_OPTIONS} />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <div className="password-wrap">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-eye"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm password</label>
            <div className="password-wrap">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-eye"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            Create account
          </button>
        </form>

        <p className="auth-bottom-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;