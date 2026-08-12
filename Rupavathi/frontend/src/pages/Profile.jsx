import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  userAPI,
  decisionAPI,
  commentAPI,
  documentAPI,
  accessLogAPI,
  extractErrorMessage,
} from '../services/api';
import RoleBadge from '../components/RoleBadge';
import BackButton from '../components/BackButton';
import Avatar from '../components/Avatar';
import './Profile.css';

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STAT_ICONS = {
  created: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  approved: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </>
  ),
  comments: (
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  ),
  documents: (
    <>
      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
      <path d="M13 2v7h7" />
    </>
  ),
};

function StatCard({ icon, value, label }) {
  return (
    <div className="profile-stat-card">
      <span className="profile-stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          {STAT_ICONS[icon]}
        </svg>
      </span>
      <div>
        <p className="profile-stat-value">{value}</p>
        <p className="profile-stat-label">{label}</p>
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [memberSince, setMemberSince] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);

  const [stats, setStats] = useState({
    decisionsCreated: 0,
    decisionsApproved: 0,
    commentsCount: 0,
    documentsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      userAPI.get(user.id),
      decisionAPI.list(),
      commentAPI.listAll(),
      documentAPI.listAll(),
      accessLogAPI.list(),
    ])
      .then(([profileRes, decisionsRes, commentsRes, documentsRes, accessLogRes]) => {
        const profile = profileRes.data;
        setFullName(profile.full_name);
        setEmail(profile.email);
        setBio(profile.bio || '');
        setPhone(profile.phone || '');
        setDepartment(profile.department || '');
        setMemberSince(profile.created_at);

        const myDecisions = decisionsRes.data.filter((d) => d.created_by === user.id);
        setStats({
          decisionsCreated: myDecisions.length,
          decisionsApproved: myDecisions.filter((d) => d.status === 'Approved').length,
          commentsCount: commentsRes.data.filter((c) => c.user_id === user.id).length,
          documentsCount: documentsRes.data.filter((d) => d.uploaded_by === user.id).length,
        });

        const sortedLogs = [...accessLogRes.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setLastLogin(sortedLogs[0]?.created_at || null);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load your profile.')))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim()) {
      setError('Full name and email cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await userAPI.update(user.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        role: user.role,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        department: department.trim() || null,
      });
      updateUser({ name: fullName.trim(), email: email.trim() });
      setSuccess('Profile updated successfully.');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="profile-hero">
        <div className="profile-hero-avatar">
          <Avatar user={user} fallbackChar={fullName.charAt(0).toUpperCase() || undefined} />
        </div>
        <div className="profile-hero-info">
          <p className="profile-hero-name">{fullName || 'Loading...'}</p>
          <div className="profile-hero-meta">
            <RoleBadge role={user?.role} />
            {department && <span className="profile-hero-department">{department}</span>}
          </div>
          {bio && <p className="profile-hero-bio">{bio}</p>}
        </div>
        {memberSince && (
          <div className="profile-hero-tenure">
            <span>Member since</span>
            <strong>{formatDate(memberSince)}</strong>
          </div>
        )}
      </div>

      <div className="profile-stats-grid">
        <StatCard icon="created" value={stats.decisionsCreated} label="Decisions Created" />
        <StatCard icon="approved" value={stats.decisionsApproved} label="Decisions Approved" />
        <StatCard icon="comments" value={stats.commentsCount} label="Comments Made" />
        <StatCard icon="documents" value={stats.documentsCount} label="Documents Uploaded" />
      </div>

      <div className="profile-content">
        <div className="profile-panel">
          <h2 className="profile-panel-title">Personal Information</h2>
          <p className="profile-panel-sub">Keep your details up to date.</p>

          {error && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          {loading ? (
            <div className="profile-loading">Loading profile...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="profile-field-row">
                <div className="profile-field">
                  <label htmlFor="full-name">Full name</label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-email">Email address</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-field-row">
                <div className="profile-field">
                  <label htmlFor="profile-phone">Phone number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    placeholder="e.g. +91 98765 43210"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-department">Department</label>
                  <input
                    id="profile-department"
                    type="text"
                    value={department}
                    placeholder="e.g. Engineering"
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  placeholder="A short professional summary about yourself."
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="profile-field">
                <label>Role</label>
                <input type="text" value={user?.role || ''} disabled />
                <p className="profile-field-hint">Your role is managed by an administrator.</p>
              </div>

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        <div className="profile-side">
          <div className="profile-panel profile-side-panel">
            <h2 className="profile-panel-title">Account Overview</h2>
            <div className="profile-overview-row">
              <span>Status</span>
              <span className="profile-status-badge">Active</span>
            </div>
            <div className="profile-overview-row">
              <span>Member since</span>
              <span>{memberSince ? formatDate(memberSince) : '—'}</span>
            </div>
            <div className="profile-overview-row">
              <span>Last login</span>
              <span>{lastLogin ? formatDateTime(lastLogin) : '—'}</span>
            </div>
          </div>

          <div className="profile-panel profile-side-panel">
            <h2 className="profile-panel-title">Security</h2>
            <p className="profile-panel-sub">
              Manage your password and account from Settings.
            </p>
            <Link to="/dashboard/settings" className="profile-settings-link">
              Go to Settings
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
