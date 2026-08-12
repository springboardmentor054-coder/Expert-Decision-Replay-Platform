export const ADMIN = 'Admin';
export const APPROVER = 'Approver';
export const DECISION_REVIEWER = 'Decision Reviewer';
export const TEAM_MEMBER = 'Team Member';
export const USER = 'User';

// Page/navigation access is open to every authenticated role. Only the
// underlying write actions below (manage users, manage roles, approve/reject)
// stay role-restricted.
export function canManageUsers() {
  return true;
}

export function canManageRoles(role) {
  return role === ADMIN;
}

export function canViewAuditLogs() {
  return true;
}

export function canViewReports() {
  return true;
}

export function canApproveDecisions(role) {
  return role === ADMIN || role === APPROVER;
}

export function canReviewOrApprove() {
  return true;
}

export const APPROVAL_LEVEL_ROLE = {
  2: APPROVER,
};

export const APPROVAL_LEVEL_LABEL = {
  2: 'Approval',
};

export function canActOnApprovalLevel(role, level) {
  if (role === ADMIN) return true;
  return role === APPROVAL_LEVEL_ROLE[level];
}
