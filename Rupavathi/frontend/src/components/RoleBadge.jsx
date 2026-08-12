import './RoleBadge.css';

const ROLE_CLASS_MAP = {
  Admin: 'role-badge-admin',
  'Decision Reviewer': 'role-badge-reviewer',
  Approver: 'role-badge-approver',
  'Team Member': 'role-badge-member',
};

function RoleBadge({ role }) {
  const roleClass = ROLE_CLASS_MAP[role] || 'role-badge-member';

  return <span className={`role-badge ${roleClass}`}>{role}</span>;
}

export default RoleBadge;