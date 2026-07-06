# User and Access Management

## Purpose of this Module

The User and Access Management module controls who can use the platform, what they can do, and which parts of the system they are allowed to access. It acts as the entry point for all users by handling registration, login, profile details, role assignment, and access permissions.

Since the Expert Decision Replay Platform is used by different people for different responsibilities, not every user should have the same level of access. This module ensures that employees, reviewers, managers, and administrators each get the permissions required for their work.

---

## How Users Interact with the Platform

Every user in the system belongs to a role. That role defines their responsibilities in the decision workflow and also determines which screens, actions, and records they can access.

The platform mainly supports four categories of users:

- Employee
- Reviewer
- Manager
- Administrator

These roles are designed around the actual flow of a decision, from creation to review, approval, and system administration.

---

## Employee Role

An employee is usually the starting point of the decision process. This role is focused on creating decisions, adding necessary details, and sending them into the workflow for review.

### What an Employee does
An employee can log in to the platform, create a new decision, attach relevant information, and submit the decision for evaluation. If the decision is still in draft state, the employee can modify it before it is reviewed. Employees can also participate in discussions, respond to reviewer feedback, and track the progress of their submissions.

### Typical actions available to an Employee
- Create new decisions
- Edit personal draft decisions
- Upload supporting documents
- Add comments or clarifications in discussions
- View personal decision history
- Search previously approved decisions for reference

---

## Reviewer Role

A reviewer is responsible for checking whether a submitted decision is complete, valid, and supported by proper reasoning or evidence. This role sits between the employee and the manager in the approval flow.

### What a Reviewer does
A reviewer examines assigned decisions, checks documents, evaluates alternatives, and verifies whether the decision is ready for approval. If information is missing or unclear, the reviewer can ask for changes or provide comments for improvement.

### Typical actions available to a Reviewer
- Open assigned decisions for evaluation
- Read attached documents and supporting notes
- Add review comments
- Request modifications from the decision creator
- Review risks, alternatives, and feasibility details
- Forward recommendations for approval or rejection

---

## Manager Role

The manager role is responsible for the final decision-making stage. Managers review the work already evaluated by reviewers and decide whether the decision should be approved, rejected, or escalated.

### What a Manager does
Managers monitor team decisions, review pending approvals, assign reviewers where required, and make final approval decisions. They are also responsible for tracking overall team progress and ensuring that decision workflows move without delay.

### Typical actions available to a Manager
- Approve decisions
- Reject decisions
- Assign reviewers
- Monitor pending team decisions
- View approval statistics and reports
- Handle escalated cases when required

---

## Administrator Role

The administrator role has the broadest control over the platform. Administrators are responsible for system-level operations rather than a single decision workflow.

### What an Administrator does
Administrators manage user accounts, assign roles, create teams, monitor platform usage, and maintain system configuration. They also review audit logs and ensure the platform remains secure and properly organized.

### Typical actions available to an Administrator
- Add or manage user accounts
- Assign or update user roles
- Maintain team information
- Access audit logs and system activity
- Configure platform settings
- View organization-level reports and analytics
- Manage security and access permissions

---

# Authentication and Login Control

To keep organizational decisions secure, the platform uses authentication and authorization mechanisms before a user is allowed to access the system.

## Authentication responsibilities of this module
- Registering new users
- Validating login credentials
- Protecting passwords using encryption or hashing
- Generating JWT tokens after successful login
- Verifying whether a user is allowed to access protected resources
- Enforcing role-based permissions after login

This ensures that users only access the actions and data that belong to their role.

---

# User Profile Structure

Each account in the system stores profile-related information so that the platform can identify the user, map them to a role, and connect them with the correct team or department.

## Information maintained for each user
- User ID
- Full name
- Email address
- Employee identifier
- Department name
- Designation or job role
- Assigned platform role
- Team information
- Account status
- Registration date
- Last login time

This information is useful for access control, reporting, auditing, and team-based decision tracking.

---

# Account Status Handling

Not every user account remains active all the time. The system keeps a status for each account to control whether the user can currently access the platform.

## Common account states
- **Active** – the user can log in and use the platform
- **Inactive** – the account exists but is temporarily disabled
- **Suspended** – the account is blocked due to a policy or security issue
- **Pending Verification** – the account has been created but is not yet fully approved or verified

---

# Access Control Approach

The platform uses role-based access control (RBAC). Instead of manually assigning permissions one by one to every user, permissions are grouped under roles. When a role is assigned, the corresponding access rights are automatically applied.

For example:
- Employees can create and manage their own decision records
- Reviewers can evaluate assigned decisions and request changes
- Managers can approve or reject decisions
- Administrators can control users, permissions, and platform settings

This makes the system easier to manage and more secure.

---

# Key Capabilities of the User Module

The User and Access Management module includes all operations required to manage users from account creation to access monitoring.

## Major capabilities
- User registration
- Secure login
- Role assignment
- Profile management
- Team assignment
- Password reset support
- Account activation and deactivation
- User search and filtering
- Activity monitoring
- Access validation

---

# Role Access Summary

The following table provides a simplified overview of which role performs which type of action in the platform.

| Action | Employee | Reviewer | Manager | Administrator |
|--------|----------|----------|---------|---------------|
| Create a decision | Yes | No | No | Yes |
| Edit own draft | Yes | No | No | Yes |
| Review assigned decisions | No | Yes | Yes | Yes |
| Approve or reject decisions | No | No | Yes | Yes |
| Assign reviewers | No | No | Yes | Yes |
| Manage users and roles | No | No | No | Yes |
| Access audit logs | No | No | No | Yes |
| Configure system settings | No | No | No | Yes |

---

# User Flow in the Platform

From a system perspective, the user journey generally follows this sequence:

1. A new user account is created or registered.
2. The administrator assigns the appropriate role.
3. The user logs in and accesses the modules allowed for that role.
4. Employees create decisions and submit them for review.
5. Reviewers examine those decisions and provide feedback.
6. Managers approve or reject the reviewed decisions.
7. Administrators monitor activity, access, and system usage in the background.

---

# Why this Module Matters

Without a proper user management layer, the platform would not be able to securely control who creates decisions, who reviews them, who approves them, and who manages the system itself. This module is important because it creates a clear separation of responsibilities, protects sensitive information, and ensures that the decision workflow operates in a controlled and accountable manner.

---

# Conclusion

The User and Access Management module is the foundation ogif platform security and operational control. It ensures that every user is identified, authenticated, assigned the correct role, and given the right level of access. By combining authentication, profile handling, role assignment, and access restriction, the platform creates a secure environment for decision management across the organization.