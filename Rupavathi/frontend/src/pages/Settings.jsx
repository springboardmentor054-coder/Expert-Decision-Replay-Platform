import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  usePreferences,
  FONT_SIZES,
  FONT_FAMILIES,
  DENSITIES,
  LANDING_PAGES,
  NOTIFICATION_CATEGORIES,
} from '../context/PreferencesContext';
import { userAPI, extractErrorMessage } from '../services/api';
import RoleBadge from '../components/RoleBadge';
import CustomSelect from '../components/CustomSelect';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import './Settings.css';

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

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

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function RowsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20l5-16h2l5 16" />
      <path d="M6.5 14h7" />
      <path d="M16 20h5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const {
    fontSize,
    fontFamily,
    setFontSize,
    setFontFamily,
    density,
    setDensity,
    defaultLandingPage,
    setDefaultLandingPage,
    notificationPrefs,
    setNotificationPref,
  } = usePreferences();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await userAPI.changePassword(user.id, currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      setPasswordError(extractErrorMessage(err, 'Could not change password.'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    showToast('Font size updated!', 'success');
  };

  const handleFontFamilyChange = (value) => {
    setFontFamily(value);
    showToast('Font style updated!', 'success');
  };

  const handleDensityChange = (value) => {
    setDensity(value);
    showToast(`${value === 'compact' ? 'Compact' : 'Comfortable'} density enabled!`, 'success');
  };

  const handleLandingPageChange = (value) => {
    setDefaultLandingPage(value);
    showToast('Default landing page updated!', 'success');
  };

  const handleNotificationToggle = (key) => {
    setNotificationPref(key, !notificationPrefs[key]);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      showToast('Image is too large. Maximum size is 3 MB.', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const { data } = await userAPI.uploadAvatar(user.id, file);
      updateUser({ avatarUrl: data.avatar_url });
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not upload profile picture.'), 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      await userAPI.removeAvatar(user.id);
      updateUser({ avatarUrl: null });
      showToast('Profile picture removed.', 'success');
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not remove profile picture.'), 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;

    setDeleteError('');
    setDeleting(true);
    try {
      await userAPI.remove(user.id);
      showToast('Account deleted successfully!', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Could not delete your account.'));
      setDeleting(false);
    }
  };

  return (
    <div className="settings-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="settings-page-header">
        <h1>Settings</h1>
        <p>Manage your account, security, and workspace preferences.</p>
      </div>

      {/* Profile header card */}
      <div className="settings-profile-card">
        <div className="settings-profile-avatar-wrap">
          <div className="settings-profile-avatar">
            <Avatar user={user} />
          </div>
          <button
            type="button"
            className="settings-avatar-edit-btn"
            onClick={() => avatarInputRef.current?.click()}
            aria-label="Upload profile picture"
            disabled={avatarUploading}
          >
            <CameraIcon />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleAvatarFileChange}
          />
        </div>

        <div className="settings-profile-info">
          <p className="settings-profile-name">{user?.name || '—'}</p>
          <p className="settings-profile-email">{user?.email || '—'}</p>
          <RoleBadge role={user?.role} />
        </div>

        <div className="settings-profile-actions">
          {avatarUploading && <span className="settings-profile-uploading">Uploading...</span>}
          {user?.avatarUrl && !avatarUploading && (
            <button type="button" className="settings-profile-remove-link" onClick={handleRemoveAvatar}>
              Remove photo
            </button>
          )}
          <Link to="/dashboard/profile" className="settings-profile-link">
            Edit full profile
            <ChevronRightIcon />
          </Link>
        </div>
      </div>

      {/* Security */}
      <section className="settings-section">
        <p className="settings-section-label">Security</p>
        <div className="settings-group settings-group-form">
          <div className="settings-row-icon-heading">
            <span className="settings-row-icon">
              <LockIcon />
            </span>
            <div>
              <p className="settings-row-label">Change Password</p>
              <p className="settings-row-desc">Choose a strong password you don't use elsewhere.</p>
            </div>
          </div>

          {passwordError && <p className="settings-error">{passwordError}</p>}
          {passwordSuccess && <p className="settings-success">{passwordSuccess}</p>}

          <form onSubmit={handleChangePassword}>
            <div className="settings-field-row">
              <div className="settings-field">
                <label htmlFor="current-password">Current password</label>
                <div className="settings-password-wrap">
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="settings-toggle-eye"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    onClick={() => setShowCurrent((prev) => !prev)}
                  >
                    <EyeIcon visible={showCurrent} />
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="new-password">New password</label>
                <div className="settings-password-wrap">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="settings-toggle-eye"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                    onClick={() => setShowNew((prev) => !prev)}
                  >
                    <EyeIcon visible={showNew} />
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <input
                id="confirm-new-password"
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="settings-save-btn" disabled={changingPassword}>
              {changingPassword ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-section">
        <p className="settings-section-label">Appearance</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-main">
              <span className="settings-row-icon">
                <RowsIcon />
              </span>
              <p className="settings-row-label">Layout Density</p>
            </div>
            <div className="settings-segmented">
              {DENSITIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-segmented-btn ${
                    density === option.value ? 'settings-segmented-btn-active' : ''
                  }`}
                  onClick={() => handleDensityChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-main">
              <span className="settings-row-icon">
                <TypeIcon />
              </span>
              <p className="settings-row-label">Font Size</p>
            </div>
            <div className="settings-segmented">
              {FONT_SIZES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`settings-segmented-btn ${
                    fontSize === option.value ? 'settings-segmented-btn-active' : ''
                  }`}
                  onClick={() => handleFontSizeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row-main">
              <span className="settings-row-icon">
                <TypeIcon />
              </span>
              <p className="settings-row-label">Font Style</p>
            </div>
            <div className="settings-row-control-select">
              <CustomSelect
                options={FONT_FAMILIES}
                value={fontFamily}
                onChange={handleFontFamilyChange}
                getOptionStyle={(option) => ({ fontFamily: option.stack })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notification preferences */}
      <section className="settings-section">
        <p className="settings-section-label">Notification Preferences</p>
        <div className="settings-group">
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <div className="settings-row" key={cat.key}>
              <div className="settings-row-main">
                <span className="settings-row-icon">
                  <BellIcon />
                </span>
                <div>
                  <p className="settings-row-label">{cat.label}</p>
                  <p className="settings-row-desc">{cat.description}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationPrefs[cat.key]}
                aria-label={`Toggle ${cat.label} notifications`}
                className={`settings-switch ${notificationPrefs[cat.key] ? 'settings-switch-on' : ''}`}
                onClick={() => handleNotificationToggle(cat.key)}
              >
                <span className="settings-switch-knob" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* General */}
      <section className="settings-section">
        <p className="settings-section-label">General</p>
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row-main">
              <span className="settings-row-icon">
                <CompassIcon />
              </span>
              <p className="settings-row-label">Default Landing Page</p>
            </div>
            <div className="settings-row-control-select">
              <CustomSelect options={LANDING_PAGES} value={defaultLandingPage} onChange={handleLandingPageChange} />
            </div>
          </div>
        </div>
      </section>

      {/* Danger zone — always last */}
      <section className="settings-section">
        <p className="settings-section-label settings-section-label-danger">Danger Zone</p>
        <div className="settings-group settings-danger-panel">
          <div className="settings-row-icon-heading">
            <span className="settings-row-icon settings-row-icon-danger">
              <WarningIcon />
            </span>
            <div>
              <p className="settings-row-label">Delete Account</p>
              <p className="settings-row-desc">This is permanent and cannot be undone.</p>
            </div>
          </div>

          {deleteError && <p className="settings-error">{deleteError}</p>}

          <button type="button" className="settings-delete-btn" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;
