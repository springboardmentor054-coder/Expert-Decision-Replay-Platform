# User Management Module

The **User Management Module** is responsible for managing users, roles, permissions, and account security within the **Expert Decision Replay Platform**. It ensures that only authorized users can access specific features based on their assigned roles.

# Module Overview

The module provides administrators with complete control over user accounts while allowing users to securely manage their own profiles. It implements Role-Based Access Control (RBAC) to ensure secure and organized access to the platform.

# Objectives

- Manage user accounts efficiently
- Provide secure authentication and authorization
- Assign roles and permissions
- Maintain user activity records
- Protect sensitive organizational data


# User Roles

## Administrator

The Administrator has complete control over the platform.

### Permissions

- Create Users
- Edit User Information
- Delete Users
- Activate or Deactivate Accounts
- Assign Roles
- Reset Passwords
- View User Activity
- Manage Departments
- Access Reports

## Reviewer

The Reviewer is responsible for reviewing organizational decisions.

### Permissions

- Review Assigned Decisions
- Approve Decisions
- Reject Decisions
- Request Changes
- Add Review Comments
- View Decision History


## Employee

Employees use the platform to submit and manage decisions.

### Permissions

- Submit New Decisions
- Edit Draft Decisions
- View Approved Decisions
- Update Personal Profile
- Change Password
- Track Decision Status

# User Features

## Account Management

- User Registration
- Secure Login
- Logout
- Forgot Password
- Reset Password
- Change Password
- Account Verification


## Profile Management

Users can:

- Update Personal Information
- Upload Profile Picture
- Update Contact Details
- Change Password
- View Account Details

## User Administration

Administrators can:

- Add New Users
- Edit User Information
- Delete User Accounts
- Activate Users
- Suspend Users
- Search Users
- Filter Users
- Assign Roles
- Manage Departments

# User Status

Each user account can have one of the following statuses:

- Active
- Inactive
- Suspended
- Pending Verification



# Role-Based Access Control (RBAC)

The platform restricts access based on user roles.

| Feature | Admin | Reviewer | Employee |
|---------|:-----:|:--------:|:--------:|
| Manage Users | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ |
| Submit Decisions | ✅ | ✅ | ✅ |
| Review Decisions | ✅ | ✅ | ❌ |
| Approve Decisions | ✅ | ✅ | ❌ |
| Generate Reports | ✅ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |


# User Information

Each user profile stores the following details:

- User ID
- Full Name
- Email Address
- Phone Number
- Department
- Designation
- Role
- Account Status
- Profile Picture
- Created Date
- Last Updated

# Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Secure Session Management
- Protected API Endpoints
- Input Validation
- Role-Based Authorization
- Password Reset Mechanism


# User Management Workflow

```text
Administrator
      │
      ▼
Create User
      │
      ▼
Assign Role
      │
      ▼
User Receives Account
      │
      ▼
Login
      │
      ▼
Access Dashboard
      │
      ▼
Perform Assigned Tasks


# APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | User login |
| GET | /api/users | Retrieve all users |
| GET | /api/users/:id | Retrieve user details |
| PUT | /api/users/:id | Update user information |
| DELETE | /api/users/:id | Delete user |
| PATCH | /api/users/:id/status | Update user status |
| PATCH | /api/users/:id/role | Change user role |
| PUT | /api/users/change-password | Change password |


# Future Enhancements

- Multi-Factor Authentication (MFA)
- Single Sign-On (SSO)
- Email Verification
- Login Notifications
- User Import & Export (Excel/CSV)
- Profile Completion Score
- Account Lockout after Multiple Failed Login Attempts
- User Activity Analytics

# Benefits

- Secure access control
- Efficient user administration
- Improved platform security
- Organized role management
- Easy profile management
- Scalable for enterprise applications
- Supports collaboration across teams

# Technology Stack

- React.js
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt
- REST APIs
- Git & GitHub
