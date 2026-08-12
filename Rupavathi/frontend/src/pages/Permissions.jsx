import { useEffect, useState } from 'react';
import { roleAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { canManageRoles } from '../utils/permissions';
import BackButton from '../components/BackButton';
import './Permissions.css';

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
    </svg>
  );
}

function Permissions() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const canManage = canManageRoles(user?.role);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRoles = () => {
    setLoading(true);
    roleAPI
      .list()
      .then(({ data }) => setRoles(data))
      .catch((err) => setListError(extractErrorMessage(err, 'Could not load roles.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadRoles, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Role name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await roleAPI.create(name.trim(), description.trim() || null);
      setRoles((prev) => [...prev, data]);
      setName('');
      setDescription('');
      showToast('Role added successfully!', 'success');
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create role.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Delete this role? This cannot be undone.')) return;
    try {
      await roleAPI.remove(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      showToast('Role deleted successfully!', 'success');
    } catch (err) {
      setListError(extractErrorMessage(err, 'Could not delete role.'));
    }
  };

  return (
    <div className="roles-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="roles-page-header">
        <h1>Role Definitions</h1>
        <p>Define organizational roles and what each one can access.</p>
      </div>

      <div className="roles-grid">
        {canManage && (
          <div className="roles-panel roles-define-panel">
            <h2>
              <span className="roles-define-plus">+</span> Define Role
            </h2>
            <p className="roles-define-sub">Create a new compliance or operational role.</p>

            {formError && <p className="roles-form-error">{formError}</p>}

            <form onSubmit={handleSubmit}>
              <div className="roles-field">
                <label htmlFor="role-name">Role Name</label>
                <input
                  id="role-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Compliance Officer"
                />
              </div>

              <div className="roles-field">
                <label htmlFor="role-description">Description</label>
                <textarea
                  id="role-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Responsibilities and access scope..."
                />
              </div>

              <button type="submit" className="roles-add-btn" disabled={saving}>
                {saving ? 'Adding...' : 'Add Role'}
              </button>
            </form>
          </div>
        )}

        <div className="roles-panel">
          <h2>Existing Roles</h2>

          {listError && <p className="roles-form-error">{listError}</p>}

          {loading ? (
            <div className="roles-empty">Loading roles...</div>
          ) : roles.length === 0 ? (
            <div className="roles-empty">No roles defined yet.</div>
          ) : (
            <div className="roles-list">
              {roles.map((role) => (
                <div className="roles-list-item" key={role.id}>
                  <div className="roles-list-icon">
                    <ShieldIcon />
                  </div>
                  <div className="roles-list-text">
                    <p className="roles-list-name">{role.name}</p>
                    <p className="roles-list-description">
                      {role.description || 'No description provided.'}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      className="roles-remove-btn"
                      onClick={() => handleDelete(role.id)}
                      aria-label={`Delete role ${role.name}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Permissions;
