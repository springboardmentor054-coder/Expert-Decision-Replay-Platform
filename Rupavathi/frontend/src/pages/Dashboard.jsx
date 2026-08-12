import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, extractErrorMessage } from '../services/api';
import { canApproveDecisions } from '../utils/permissions';
import StatCard from '../components/StatCard';
import RoleBadge from '../components/RoleBadge';
import {
  DecisionStatusChart,
  CategoryChart,
  MonthlyTrendChart,
  ApprovalStatsChart,
} from '../components/DashboardCharts';
import './Dashboard.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
  return { text: 'Good evening', emoji: '🌙' };
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ICONS = {
  file: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  cross: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  team: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </>
  ),
  comment: (
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  ),
};

const ACTIVITY_ICON = {
  'Decision Created': 'file',
  'Decision Approved': 'check',
  'Document Uploaded': 'upload',
  'Comment Added': 'comment',
};

const REFRESH_INTERVAL_MS = 30000;

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'Team Member';
  const greeting = getGreeting();

  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let isFirstLoad = true;

    const loadDashboard = () => {
      if (isFirstLoad) setLoading(true);

      Promise.all([dashboardAPI.summary(), dashboardAPI.charts(), dashboardAPI.analytics()])
        .then(([summaryRes, chartsRes, analyticsRes]) => {
          if (cancelled) return;
          setSummary(summaryRes.data);
          setCharts(chartsRes.data);
          setAnalytics(analyticsRes.data);
          setError('');
        })
        .catch((err) => {
          if (!cancelled) setError(extractErrorMessage(err, 'Could not load dashboard data.'));
        })
        .finally(() => {
          if (!cancelled && isFirstLoad) {
            setLoading(false);
            isFirstLoad = false;
          }
        });
    };

    loadDashboard();
    const intervalId = setInterval(loadDashboard, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const statCards = summary
    ? [
        { label: 'Total Decisions', value: summary.total_decisions, icon: ICONS.file },
        { label: 'Approved Decisions', value: summary.approved_decisions, icon: ICONS.check },
        { label: 'Pending Decisions', value: summary.pending_decisions, accent: true, icon: ICONS.clock },
        { label: 'Rejected Decisions', value: summary.rejected_decisions, icon: ICONS.cross },
        { label: 'Active Users', value: summary.active_users, icon: ICONS.team },
        { label: 'Total Documents', value: summary.total_documents, icon: ICONS.file },
      ]
    : [];

  let quickActions;
  if (role === 'Admin') {
    quickActions = [];
  } else if (canApproveDecisions(role)) {
    quickActions = [{ to: '/dashboard/approvals', label: 'Review Pending Approvals' }];
  } else {
    quickActions = [];
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-welcome">
        <div>
          <h1>
            {greeting.text}, {user?.name || role}
            <span className="dashboard-welcome-emoji" aria-hidden="true">
              {greeting.emoji}
            </span>
          </h1>
          <p>Here's what's happening with your decisions today.</p>
        </div>
        <div className="dashboard-welcome-meta">
          <RoleBadge role={role} />
          <span className="dashboard-welcome-date">{formatToday()}</span>
        </div>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="stats-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <StatCard key={i} label="Loading..." value="—" icon={ICONS.file} />
            ))
          : statCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                accent={card.accent}
                icon={card.icon}
              />
            ))}
      </div>

      {quickActions.length > 0 && (
        <div className="dashboard-quick-actions">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to} className="dashboard-quick-action-btn">
              {action.label}
            </Link>
          ))}
        </div>
      )}

      {!loading && charts && (
        <div className="charts-grid">
          <DecisionStatusChart data={charts.decision_status_distribution} />
          <CategoryChart data={charts.decisions_by_category} />
          <MonthlyTrendChart data={charts.monthly_decisions} />
          <ApprovalStatsChart data={charts.approval_statistics} />
        </div>
      )}

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Activities</h2>
          </div>

          {loading ? (
            <div className="dashboard-empty">Loading...</div>
          ) : !analytics || analytics.recent_activities.length === 0 ? (
            <div className="dashboard-empty">No recent activity yet.</div>
          ) : (
            <ul className="activity-list">
              {analytics.recent_activities.map((activity) => (
                <li key={activity.id} className="activity-item">
                  <span className="activity-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      {ICONS[ACTIVITY_ICON[activity.action_type]] || ICONS.file}
                    </svg>
                  </span>
                  <span className="activity-body">
                    <span className="activity-description">{activity.description}</span>
                    <span className="activity-meta">
                      {activity.user_name} &middot; {formatDateTime(activity.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <RolePanel role={role} analytics={analytics} loading={loading} />
      </div>
    </div>
  );
}

function RolePanel({ role, analytics, loading }) {
  if (loading) {
    return (
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Overview</h2>
        </div>
        <div className="dashboard-empty">Loading...</div>
      </div>
    );
  }

  if (analytics?.admin) {
    const { system_analytics, user_activity, organization_reports } = analytics.admin;
    return (
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Administrator Overview</h2>
        </div>

        <p className="role-panel-subhead">System Analytics</p>
        <div className="role-metric-row">
          <span>Total Decisions</span>
          <span>{system_analytics.total_decisions}</span>
        </div>
        <div className="role-metric-row">
          <span>Total Users</span>
          <span>{system_analytics.total_users}</span>
        </div>
        <div className="role-metric-row">
          <span>Total Documents</span>
          <span>{system_analytics.total_documents}</span>
        </div>
        <div className="role-metric-row">
          <span>Total Categories</span>
          <span>{system_analytics.total_categories}</span>
        </div>

        <p className="role-panel-subhead role-panel-subhead-spaced">Most Active Users</p>
        {user_activity.length === 0 ? (
          <p className="dashboard-empty">No user activity recorded yet.</p>
        ) : (
          user_activity.map((row) => (
            <div className="role-metric-row" key={row.user_name}>
              <span>{row.user_name}</span>
              <span>{row.action_count} actions</span>
            </div>
          ))
        )}

        <p className="role-panel-subhead role-panel-subhead-spaced">Organization Reports</p>
        <div className="role-metric-row">
          <span>Approved</span>
          <span>{organization_reports.decisions_by_status.find((s) => s.status === 'Approved')?.count ?? 0}</span>
        </div>
        <div className="role-metric-row">
          <span>Rejected</span>
          <span>{organization_reports.decisions_by_status.find((s) => s.status === 'Rejected')?.count ?? 0}</span>
        </div>
        <Link to="/dashboard/reports/decisions" className="role-panel-link">
          View full reports &rarr;
        </Link>
      </div>
    );
  }

  if (analytics?.manager) {
    const { team_decisions, pending_approvals, decision_statistics } = analytics.manager;
    return (
      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Manager Overview</h2>
        </div>

        <div className="role-metric-row">
          <span>Team Decisions</span>
          <span>{team_decisions}</span>
        </div>
        <div className="role-metric-row">
          <span>Pending Approvals</span>
          <span>{pending_approvals}</span>
        </div>

        <p className="role-panel-subhead role-panel-subhead-spaced">Decision Statistics</p>
        <div className="role-metric-row">
          <span>Approved</span>
          <span>{decision_statistics.approved}</span>
        </div>
        <div className="role-metric-row">
          <span>Rejected</span>
          <span>{decision_statistics.rejected}</span>
        </div>
        <div className="role-metric-row">
          <span>Pending</span>
          <span>{decision_statistics.pending}</span>
        </div>
        <Link to="/dashboard/approvals" className="role-panel-link">
          Go to Pending Approvals &rarr;
        </Link>
      </div>
    );
  }

  const employee = analytics?.employee;
  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2>My Overview</h2>
      </div>

      <div className="role-metric-row">
        <span>My Decisions</span>
        <span>{employee?.my_decisions ?? 0}</span>
      </div>
      <div className="role-metric-row">
        <span>Pending Reviews</span>
        <span>{employee?.pending_reviews ?? 0}</span>
      </div>
      <Link to="/dashboard/decisions/new" className="role-panel-link">
        Create a new decision &rarr;
      </Link>
    </div>
  );
}

export default Dashboard;
