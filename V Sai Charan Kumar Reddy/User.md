# User Management

## Overview

The User Management module is responsible for managing users, authentication, authorization, and role-based access control (RBAC). Every user is assigned a specific role that determines the actions they can perform within the Expert Decision Replay Platform.

## User Roles

### 1. Employee

Employees are the primary users who create and manage decisions.

#### Responsibilities
- Register and log in to the platform.
- Create new decision records.
- Edit their own draft decisions.
- Upload supporting documents.
- Record alternative solutions.
- Participate in discussion threads.
- View the status of submitted decisions.
- Search previous approved decisions.

#### Permissions
- Create Decision
- Edit Own Drafts
- Upload Files
- Add Comments
- View Own Decisions
- Search Knowledge Repository

---

### 2. Reviewer

Reviewers evaluate submitted decisions before they reach managers.

#### Responsibilities
- Review assigned decisions.
- Verify attached documents.
- Analyze alternatives and risks.
- Provide comments and suggestions.
- Request modifications if necessary.
- Recommend approval or rejection.

#### Permissions
- View Assigned Decisions
- Add Review Comments
- Request Changes
- Recommend Approval
- View Decision History

---

### 3. Manager

Managers make final approval decisions and oversee team activities.

#### Responsibilities
- Approve or reject reviewed decisions.
- Assign reviewers.
- Monitor team decision progress.
- View decision statistics.
- Resolve escalated requests.
- Track approval history.

#### Permissions
- Approve Decisions
- Reject Decisions
- Assign Reviewers
- View Team Dashboard
- Access Reports
- Monitor Team Performance

---

### 4. Administrator

Administrators manage the overall platform and system configuration.

#### Responsibilities
- Manage users and roles.
- Create and manage teams.
- Configure system settings.
- Monitor audit logs.
- Generate organization-wide reports.
- Manage security and access permissions.
- Maintain system performance.

#### Permissions
- Full System Access
- User Management
- Role Management
- Team Management
- System Configuration
- Audit Log Access
- Reports & Analytics
- Dashboard Administration

---

# Authentication

The platform uses secure authentication with JWT-based login and role-based authorization.

Features:
- User Registration
- Secure Login
- Password Encryption
- JWT Authentication
- Role-Based Access Control (RBAC)
- Session Management

---

# User Profile

Each user profile contains:

- User ID
- Full Name
- Email Address
- Employee ID
- Department
- Designation
- Assigned Role
- Team
- Account Status
- Created Date
- Last Login

---

# Account Status

- Active
- Inactive
- Suspended
- Pending Verification

---

# User Management Features

- User Registration
- User Login
- User Profile Management
- Role Assignment
- Team Assignment
- Password Reset
- Account Activation/Deactivation
- User Search
- Activity Tracking

---

# Access Control Matrix

| Feature | Employee | Reviewer | Manager | Administrator |
|----------|----------|----------|----------|---------------|
| Create Decision | ✅ | ❌ | ❌ | ✅ |
| Edit Own Decision | ✅ | ❌ | ❌ | ✅ |
| Review Decision | ❌ | ✅ | ✅ | ✅ |
| Approve Decision | ❌ | ❌ | ✅ | ✅ |
| Reject Decision | ❌ | ❌ | ✅ | ✅ |
| Assign Reviewer | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Manage Roles | ❌ | ❌ | ❌ | ✅ |
| Generate Reports | ❌ | ❌ | ✅ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ |
| Configure System | ❌ | ❌ | ❌ | ✅ |

---

# Workflow

1. User registers and logs in.
2. Administrator assigns a role.
3. Employee creates a decision.
4. Reviewer evaluates the decision.
5. Manager approves or rejects it.
6. Administrator monitors system activities and audit logs.