import { useEffect, useState } from 'react';
import { userAPI, extractErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RoleBadge from '../components/RoleBadge';
import FilterTabs from '../components/FilterTabs';
import BackButton from '../components/BackButton';
import './Users.css';

const STATUS_TABS = ['All', 'Active'];

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    userAPI
      .list()
      .then(({ data }) => setUsers(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load users.')))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === 'All' || activeTab === 'Active';
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.full_name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="users-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="users-page-header">
        <div>
          <h1>Users</h1>
          <p>Manage team members and their roles across your workspace.</p>
        </div>
      </div>

      <div className="users-toolbar">
        <FilterTabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="users-search">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-panel">
        {error && <p className="users-error">{error}</p>}

        <div className="users-full-table">
          <div className="users-full-table-head">
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
          </div>

          {loading ? (
            <div className="users-empty">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="users-empty">No users match your search or filter.</div>
          ) : (
            filteredUsers.map((user) => (
              <div className="users-full-table-row" key={user.id}>
                <div className="users-member-cell">
                  <div className="users-avatar">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="users-member-name">{user.full_name}</p>
                    <p className="users-member-email">{user.email}</p>
                  </div>
                </div>
                <span>
                  <RoleBadge role={user.role} />
                </span>
                <span>
                  <StatusBadge status="Active" />
                </span>
                <span className="users-joined-date">{formatDate(user.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;
