# Expert Decision Replay Platform

## Objective

The Expert Decision Replay Platform is a centralized web-based application designed to record, manage, review, approve, and replay important organizational decisions.

The platform helps organizations preserve decision-making knowledge by documenting problem statements, alternatives, discussions, approvals, implementation status, and final outcomes. It provides a structured environment for collaboration, decision tracking, accountability, and organizational learning.

---

## Project Description

The system enables organizations to review historical decisions, understand the reasoning behind them, and improve future decision-making processes.

The platform provides:

* Structured decision management
* Alternative analysis and comparison
* Document management
* Discussion and collaboration
* Multi-level approval workflows
* Version tracking
* Notifications
* Audit logging
* Dashboard and analytics
* PDF and Excel reports
* Secure role-based authentication

This project was developed as part of the Infosys Springboard Internship.

---

## Key Features

* User Authentication
* User Management
* Decision Management
* Alternative Analysis
* Document Management
* Discussion Module
* Version Tracking
* Approval Workflow
* Notifications
* Audit Logs
* Dashboard and Reports
* Password Reset
* PDF and Excel Export
* Role-Based Access Control

---

## User Roles

* Employee
* Reviewer
* Manager
* Administrator

Each role has access to functionality according to the permissions defined by the application.

---

## Technology Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn
* Python-JOSE
* Passlib
* bcrypt

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* React Router

### Database

* PostgreSQL

### Authentication & Security

* JWT Authentication
* OAuth2 Password Flow
* bcrypt password hashing
* Role-Based Access Control

### Reports

* ReportLab
* OpenPyXL

### Email

* Resend

### Development Tools

* Git
* GitHub
* Postman
* VS Code

### Deployment

* Docker
* Docker Compose
* Render

---

## Project Structure

```text
Expert-Decision-Replay-Platform/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/
│   ├── Dockerfile
│   └── package.json
│
├── database/
├── docs/
├── screenshots/
├── testing/
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## Database Tables

The application uses PostgreSQL and includes the following major entities:

* Users
* Roles
* Teams
* Decision Categories
* Decisions
* Alternatives
* Comments
* Meeting Notes
* Decision Versions
* Approvals
* Notifications
* Documents
* Audit Logs

---

## ER Diagram

The Entity Relationship Diagram files are available in the `database` folder.

* `Decision_Replay_ER_Diagram.drawio`
* `Decision_Replay_ER_Diagram.png`

The ER diagram defines the relationships between the major entities used by the platform.

---

# Milestone Progress

## Milestone 1

### Requirement Analysis

* Identified project objectives and requirements.
* Finalized project modules and user roles.

### ER Diagram

* Designed the Entity Relationship Diagram.
* Defined relationships between core entities.

### Database Design

* Finalized PostgreSQL database schema.
* Created tables and relationships for the application.

### FastAPI Backend Initialization

* Initialized the FastAPI project structure.
* Configured database connectivity using SQLAlchemy.

### React Frontend Initialization

* Initialized the React application.

### Authentication Module

* Implemented JWT-based user registration and login.
* Secured API endpoints using token authentication.

### User Management

* Implemented user creation and retrieval.
* Added role support for users.

**Milestone 1 Successfully Completed**

---

## Milestone 2

### Decision Management

* Implemented decision creation, viewing, updating, and deletion.
* Added decision categorization and status management.
* Added decision details pages.

### Alternatives

* Implemented alternative creation, editing, and deletion.
* Added alternative comparison.
* Added cost and risk evaluation.

### Documents

* Implemented document upload.
* Implemented document viewing and downloading.
* Implemented document deletion.

### Discussions

* Implemented comments and discussion functionality.
* Added comment management.

### Version Tracking

* Implemented automatic decision version creation.
* Added version history.

**Milestone 2 Successfully Completed**

---

## Milestone 3

### Validation

* Added validation for decision-related data.
* Added alternative validation.
* Added required-field validation.

### Approval Workflow

* Implemented decision submission for approval.
* Implemented approval and rejection.
* Added approval history.
* Added role-based approval access.

### Notifications

* Implemented automatic notifications for important decision-related actions.

### Audit Logging

* Implemented automatic audit log generation.
* Recorded important user actions.
* Restricted Audit Logs to Administrators.

**Milestone 3 Successfully Completed**

---

## Milestone 4

Milestone 4 focused on testing, bug fixing, Docker deployment, documentation, and final presentation preparation.

### Authentication & Security

* JWT authentication verified.
* Password hashing verified.
* Wrong-password handling tested.
* Invalid email validation tested.
* Empty-field validation tested.
* Password change functionality verified.
* Password reset functionality implemented.

### User Management

* User creation tested.
* User updates tested.
* Role assignment tested.
* Role-based access tested.

### Decision Management

* Decision creation tested.
* Decision viewing tested.
* Decision updating tested.
* Decision deletion tested.
* Status changes tested.
* Required-field validation tested.

### Alternatives

* Alternative creation tested.
* Alternative editing tested.
* Alternative deletion tested.
* Alternative comparison tested.

### Documents

* Document upload tested.
* Document viewing tested.
* Document download tested.
* Document deletion tested.

### Discussions

* Comment creation tested.
* Comment viewing tested.
* Comment management tested.

### Version Tracking

* Decision editing was tested.
* Automatic creation of a new decision version was verified.

### Approval Workflow

* Submission for approval tested.
* Approval tested.
* Rejection tested.
* Approval history tested.

### Notifications

* Notifications for important actions were tested.
* Notification delivery to appropriate user roles was verified.

### Audit Logs

Important user actions were verified in Audit Logs, including:

* LOGIN
* DECISION_CREATED
* COMMENT_ADDED
* DECISION_APPROVED

### Reports & Dashboard

* Dashboard statistics were tested.
* Decision status statistics were verified.
* Category-based statistics were verified.
* Approval statistics were verified.
* PDF export tested.
* Excel export tested.
* Report values were compared against application data.

---

# Testing

The application was tested locally and after deployment.

## Authentication Testing

| Test                         | Expected Result                            | Status |
| ---------------------------- | ------------------------------------------ | ------ |
| Register with valid data     | User registered successfully               | PASS   |
| Login with valid credentials | User logged in successfully                | PASS   |
| Wrong password               | Proper error displayed                     | PASS   |
| Invalid email                | Validation error displayed                 | PASS   |
| Empty required fields        | Validation error displayed                 | PASS   |
| JWT authentication           | Protected resources require authentication | PASS   |
| Password change              | Password changed successfully              | PASS   |
| Password reset               | Reset flow implemented and tested          | PASS   |

## User Management Testing

| Test              | Status |
| ----------------- | ------ |
| Create user       | PASS   |
| Update user       | PASS   |
| Role assignment   | PASS   |
| Role-based access | PASS   |

## Decision Management Testing

| Test                      | Status |
| ------------------------- | ------ |
| Create decision           | PASS   |
| View decision             | PASS   |
| Update decision           | PASS   |
| Delete decision           | PASS   |
| Status changes            | PASS   |
| Required-field validation | PASS   |

## Alternatives Testing

| Test                   | Status |
| ---------------------- | ------ |
| Create alternative     | PASS   |
| Update alternative     | PASS   |
| Delete alternative     | PASS   |
| Alternative comparison | PASS   |

## Documents Testing

| Test              | Status |
| ----------------- | ------ |
| Upload document   | PASS   |
| View document     | PASS   |
| Download document | PASS   |
| Delete document   | PASS   |

## Discussions Testing

| Test               | Status |
| ------------------ | ------ |
| Add comment        | PASS   |
| View comments      | PASS   |
| Comment management | PASS   |

## Approval Testing

| Test                | Status |
| ------------------- | ------ |
| Submit for approval | PASS   |
| Approve decision    | PASS   |
| Reject decision     | PASS   |
| Approval history    | PASS   |

## Deployment Testing

The deployed application was tested through the public frontend URL.

The following workflows were verified:

* Login
* Dashboard
* Decisions
* Alternatives
* Documents
* Comments
* Version Tracking
* Approval Workflow
* Notifications
* Audit Logs
* Reports
* PDF Export
* Excel Export

**Deployment Testing Result: PASS**

---

# Bug Fixing

During Milestone 4, several application and deployment issues were identified and resolved.

Major fixes included:

* Fixed authentication and password hashing issues.
* Fixed Passlib and bcrypt compatibility.
* Fixed frontend-backend API URL configuration.
* Fixed dashboard status normalization.
* Fixed dashboard and report statistics.
* Fixed decision category display in reports.
* Fixed approval workflow behavior.
* Fixed notification generation for different user roles.
* Fixed Audit Log access and verification.
* Added duplicate email validation during registration.
* Fixed Docker configuration issues.
* Fixed production database connectivity.
* Fixed deployment configuration issues.

After applying the fixes, the major application workflows were retested successfully.

---

# Environment Variables

Environment variables are used to store sensitive configuration values.

## Backend

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL=your_postgresql_database_url
RESEND_API_KEY=your_resend_api_key
```

## Frontend

Create a `.env` file inside the `frontend` directory.

For local development:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

For production:

```env
REACT_APP_API_URL=https://expert-decision-replay-platform-2pe5.onrender.com
```

**Do not commit `.env` files, passwords, database credentials, or API keys to GitHub.**

The project `.gitignore` excludes environment files.

---

# Database Setup

The application uses PostgreSQL as its database.

Configure the PostgreSQL connection using the `DATABASE_URL` environment variable.

The backend uses SQLAlchemy to communicate with PostgreSQL.

---

# API Documentation

The backend is built using FastAPI and provides interactive API documentation through Swagger UI.

## Local API Documentation

```text
http://127.0.0.1:8000/docs
```

## Production API Documentation

https://expert-decision-replay-platform-2pe5.onrender.com/docs

The API provides functionality for:

* Authentication
* User Management
* Decisions
* Alternatives
* Documents
* Comments
* Version Tracking
* Approvals
* Notifications
* Audit Logs
* Reports
* Dashboard

---

# Docker Deployment

The project includes Docker configuration for containerized deployment.

Docker files include:

* `backend/Dockerfile`
* `frontend/Dockerfile`
* `docker-compose.yml`

## Build Containers

From the project root:

```bash
docker compose build
```

## Start Containers

```bash
docker compose up
```

## Stop Containers

```bash
docker compose down
```

Docker provides a consistent environment for running and deploying the application.

---

# Production Deployment

The application has been deployed using Render.

## Frontend

https://expert-decision-replay-frontend.onrender.com

## Backend

https://expert-decision-replay-platform-2pe5.onrender.com

## API Documentation

https://expert-decision-replay-platform-2pe5.onrender.com/docs

The deployed system consists of:

* React frontend
* FastAPI backend
* PostgreSQL database
* REST API communication
* Environment-based configuration
* Docker configuration

The frontend communicates successfully with the deployed backend.

---

# Security

The application implements the following security measures:

* JWT-based authentication.
* Secure password hashing using bcrypt.
* Protected API endpoints.
* Role-Based Access Control.
* Administrator-only Audit Log access.
* Environment variables for sensitive configuration.
* `.env` files excluded from Git.
* Secure password reset tokens.

---

# Known Limitation

The password reset feature uses the Resend email service.

The current Resend account is configured for testing. Resend testing restrictions require a verified sending domain before emails can be sent to arbitrary users.

For full production email delivery, a verified domain and production sender address should be configured.

The password reset implementation itself is integrated into the application and the reset flow has been tested.

---

# Future Improvements

Possible future improvements include:

* Verify a production email domain for password-reset emails.
* Add advanced search and filtering.
* Add more detailed analytics.
* Add customizable notification preferences.
* Improve document validation and storage.
* Add more granular permissions.
* Add automated unit and integration testing.
* Add a CI/CD pipeline.

---

# Production URLs

**Frontend**

https://expert-decision-replay-frontend.onrender.com

**Backend**

https://expert-decision-replay-platform-2pe5.onrender.com

**Swagger API Documentation**

https://expert-decision-replay-platform-2pe5.onrender.com/docs

---

# Project Status

The Expert Decision Replay Platform has completed the major Milestone 4 requirements.

* Authentication: Complete
* User Management: Complete
* Decision Management: Complete
* Alternative Comparison: Complete
* File Uploads: Complete
* Discussion Module: Complete
* Version Tracking: Complete
* Approval Workflow: Complete
* Notifications: Complete
* Audit Logging: Complete
* Reports: Complete
* Dashboard: Complete
* Testing: Complete
* Major Bug Fixes: Complete
* Docker Configuration: Complete
* Frontend Deployment: Complete
* Backend Deployment: Complete
* Database Connected: Complete
* Environment Variables Configured: Complete
* API Documentation: Available
* GitHub Repository: Available
* Final Demonstration: Ready

**Milestone 4 Successfully Completed**

---

# Expected Outcome

The completed platform provides:

* Centralized decision management
* Secure role-based authentication
* Multi-level approval workflow
* Collaborative decision discussions
* Decision history and version tracking
* Document management
* Notifications
* Audit tracking
* Reporting and analytics dashboard
* Production deployment
* Scalable and maintainable architecture

---

# Team Member

**Sushil Kumar**
