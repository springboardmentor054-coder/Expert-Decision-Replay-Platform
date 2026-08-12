import { NavLink, Outlet } from 'react-router-dom';
import BackButton from '../components/BackButton';
import '../pages/Reports.css';
import './ReportsLayout.css';

const REPORT_TABS = [
  { to: '/dashboard/reports/decisions', label: 'Decision Report' },
  { to: '/dashboard/reports/approvals', label: 'Approval Report' },
  { to: '/dashboard/reports/teams', label: 'Team Report' },
  { to: '/dashboard/reports/audit', label: 'Audit Report' },
];

function ReportsLayout() {
  return (
    <div className="reports-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="reports-page-header">
        <h1>Reports</h1>
        <p>Summarized insights across decisions, approvals, teams, and system activity.</p>
      </div>

      <div className="reports-subnav">
        {REPORT_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `reports-subnav-link ${isActive ? 'reports-subnav-link-active' : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

export default ReportsLayout;
