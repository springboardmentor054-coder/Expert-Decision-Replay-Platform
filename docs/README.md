# Expert Decision Replay Platform

## Overview

The **Expert Decision Replay Platform** is a web-based knowledge management and decision intelligence system designed to capture, organize, review, and reuse expert decisions within an organization.

The platform preserves important decision-making knowledge so that employees and teams can refer to previous decisions, understand their outcomes, collaborate effectively, and make better-informed future decisions.

---

## Problem Statement

Organizations often lose valuable knowledge when experienced employees leave or when important decisions are not documented properly.

This can result in:

- Repeated analysis of similar problems
- Loss of organizational knowledge
- Inconsistent decision-making
- Difficulty tracking why decisions were made
- Limited visibility into previous outcomes

The Expert Decision Replay Platform addresses these problems by maintaining a centralized repository where decisions and their associated information can be recorded, reviewed, approved, tracked, and reused.

---

## Objectives

- Store and manage expert decisions in a centralized platform.
- Preserve organizational decision-making knowledge.
- Enable users to review previous decisions.
- Implement secure user authentication.
- Provide role-based access control.
- Support decision approval and rejection workflows.
- Maintain decision version history.
- Maintain audit logs for important activities.
- Support documents, alternatives, discussions, and comments.
- Provide dashboard analytics and reports.
- Improve collaboration between employees, experts, and administrators.

---

# Features

## Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Password hashing
- Invalid login handling
- Logout functionality

## User Management

- View users
- Manage users
- Role assignment
- Role-based access control
- Admin, Expert, and Employee roles

## Decision Management

- Create decisions
- View decisions
- Update decisions
- Delete decisions
- Track decision status
- Submit decisions for approval

## Alternative Management

- Add alternatives to decisions
- View alternatives
- Update alternatives
- Delete alternatives
- Compare alternatives

## Document Management

- Upload documents
- View uploaded documents
- Download documents
- Delete documents
- Associate documents with decisions

## Discussions and Comments

- Add comments
- View comments
- Edit comments where permitted
- Delete comments where permitted
- Support collaboration around decisions

## Version Tracking

- Maintain decision version history
- Record changes made to decisions
- View previous decision versions

## Approval Workflow

- Submit draft decisions for approval
- Approve decisions
- Reject decisions
- Restrict approval actions based on user role
- Track decision status throughout the workflow

## Notifications

- Generate notifications for relevant decision actions
- Allow users to view notifications
- Track read/unread notification status

## Audit Logging

- Record important system actions
- Track user activities
- Maintain an audit history for accountability

## Dashboard

- Display total decisions
- Display approved decisions
- Display rejected decisions
- Display pending/draft decision information
- Provide a summary of decision activity

## Reports

- Provide decision-related reports
- Display summarized platform information
- Support management and review of decision data

---

# User Roles

## Admin

The administrator has elevated privileges within the platform.

Responsibilities include:

- Managing users
- Managing roles
- Reviewing system information
- Approving or rejecting submitted decisions
- Viewing reports
- Viewing audit information
- Managing platform-level activities

## Expert

Experts participate in the organizational decision-making process.

Depending on assigned permissions, experts can:

- View decisions
- Review decision information
- Work with alternatives
- Participate in discussions
- Provide decision-related input

## Employee

Employees can participate in the decision workflow.

Depending on permissions, employees can:

- Create decisions
- View permitted decisions
- Add supporting information
- Participate in discussions
- Submit their draft decisions for approval

---

# Technology Stack

## Frontend

- React.js
- Create React App (CRA)
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic

## Database

- PostgreSQL

## Authentication and Security

- JWT (JSON Web Token)
- Password hashing
- Role-Based Access Control (RBAC)
- FastAPI authentication dependencies

## Deployment

- Docker
- Docker Compose
- Render Web Services
- Render PostgreSQL

## Development Tools

- Visual Studio Code
- Git
- GitHub
- pgAdmin 4
- FastAPI Swagger UI
- Web Browser Developer Tools

---

# System Architecture

The application follows a three-tier architecture:

```text
+----------------------------+
|       React Frontend       |
|       (React CRA)          |
+-------------+--------------+
              |
              | HTTP / REST API
              |
              v
+----------------------------+
|       FastAPI Backend      |
| Python + SQLAlchemy + JWT  |
+-------------+--------------+
              |
              | Database Connection
              |
              v
+----------------------------+
|         PostgreSQL         |
|        Render Database     |
+----------------------------+
```

The React frontend communicates with the FastAPI backend through REST API requests.

The FastAPI backend performs authentication, business logic, validation, database operations, approval processing, notifications, audit logging, and reporting.

PostgreSQL stores the persistent application data.

---

# Project Structure

```text
Expert-Decision-Replay-Platform/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── uploads/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
│
├── frontend-cra/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── api.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
└── README.md
```

---

# Prerequisites

Before running the application locally, install:

- Python 3.10 or later
- Node.js
- npm
- PostgreSQL
- Git
- Docker Desktop (for Docker execution)

Optional development tools:

- Visual Studio Code
- pgAdmin 4

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor054-coder/Expert-Decision-Replay-Platform.git
```

Move into the project:

```bash
cd Expert-Decision-Replay-Platform
```

Checkout the project branch:

```bash
git checkout jyothi-chekka
```

---

# Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn app.main:app --reload
```

The local backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation is available locally at:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal and move into:

```bash
cd frontend-cra
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend normally runs locally at:

```text
http://localhost:3000
```

---

# Environment Variables

Sensitive configuration should be provided using environment variables rather than hard-coded into source code.

Backend/database configuration uses variables such as:

```env
POSTGRES_USER=your_database_username
POSTGRES_PASSWORD=your_database_password
POSTGRES_HOST=your_database_host
POSTGRES_PORT=5432
POSTGRES_DB=your_database_name
FRONTEND_URL=http://localhost:3000
```

Frontend production configuration:

```env
REACT_APP_API_URL=https://your-backend-url
```

For local development:

```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

> Never commit real database passwords, JWT secrets, API keys, or other credentials to a public repository.

---

# Database Setup

The application uses **PostgreSQL** as its relational database.

SQLAlchemy is used by the FastAPI backend for database interaction.

The platform stores information including:

- Users
- Roles
- Decisions
- Alternatives
- Documents
- Comments
- Discussions
- Decision versions
- Notifications
- Audit logs

For local development, PostgreSQL can be managed using pgAdmin 4.

For production, the application uses a PostgreSQL database hosted on Render.

---

# API Documentation

FastAPI automatically generates interactive API documentation using Swagger UI.

## Local API Documentation

```text
http://127.0.0.1:8000/docs
```

## Production API Documentation

https://expert-decision-replay-platform.onrender.com/docs

The Swagger interface can be used to inspect and test the available API endpoints.

Major API groups include:

- Authentication
- Users
- Roles
- Decisions
- Alternatives
- Documents
- Comments
- Discussions
- Decision Versions
- Approval
- Notifications
- Audit Logs
- Dashboard
- Reports

---

# Docker

The application includes Docker configuration for deployment and containerized execution.

## Backend Docker

The backend Docker image:

1. Uses a Python base image.
2. Installs dependencies from `requirements.txt`.
3. Copies the FastAPI source code.
4. Starts the application using Uvicorn.

Example:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Frontend Docker

The React frontend is built inside Docker and served as a production application.

## Docker Compose

The project also contains:

```text
docker-compose.yml
```

which can be used to configure multiple application services for local/containerized execution.

To build the services:

```bash
docker compose build
```

To start them:

```bash
docker compose up
```

To stop them:

```bash
docker compose down
```

---

# Production Deployment

The application is deployed using **Render**.

## Frontend

Production frontend:

https://expert-decision-frontend.onrender.com

## Backend

Production backend:

https://expert-decision-replay-platform.onrender.com

## API Documentation

Production Swagger documentation:

https://expert-decision-replay-platform.onrender.com/docs

## Database

The production database uses **Render PostgreSQL**.

The deployed architecture is:

```text
User
  |
  v
React Frontend (Render)
  |
  v
FastAPI Backend (Render)
  |
  v
PostgreSQL Database (Render)
```

Production environment variables are configured through Render rather than being hard-coded into the application.

CORS is configured so that the deployed frontend can communicate with the deployed FastAPI backend.

---

# Testing

The application was tested both locally and after production deployment.

## Authentication Testing

- User registration
- Valid login
- Invalid login
- Wrong password
- Empty-field validation
- JWT authentication
- Protected routes
- Logout

## User Management Testing

- View users
- User management operations
- Role assignment
- Role-based access

## Decision Testing

- Create decision
- View decision
- Update decision
- Delete decision
- Decision status changes
- Missing/invalid input handling
- Submit decision for approval

## Alternative Testing

- Create alternative
- View alternatives
- Update alternative
- Delete alternative
- Alternative comparison

## Document Testing

- Upload document
- View document
- Download document
- Delete document
- File validation

## Discussion Testing

- Add comments
- View comments
- Edit/delete comments where applicable

## Version Tracking Testing

- Edit a decision
- Confirm creation of decision version history
- View previous versions

## Approval Testing

- Submit draft decision for approval
- Approve decision
- Reject decision
- Verify role-based approval permissions

## Notification Testing

- Verify notifications are created for appropriate actions
- View notifications
- Verify notification status

## Audit Log Testing

- Perform application actions
- Confirm actions are recorded in audit logs

## Dashboard and Reports Testing

- Verify dashboard data
- Verify report information
- Compare displayed values with stored database information

## Deployment Testing

The deployed application was tested for:

- Frontend accessibility
- Backend accessibility
- Database connectivity
- Frontend-to-backend communication
- Authentication
- Major decision workflows
- Production API responses

---

# Testing Result

The major application modules were tested successfully.

The application:

- Starts correctly
- Handles valid and invalid inputs
- Supports authentication
- Protects restricted functionality
- Stores application data in PostgreSQL
- Supports the major decision workflow
- Handles application errors
- Runs through Docker
- Is accessible using public deployment URLs
- Connects the deployed frontend, backend, and database

---

# Screenshots

Screenshots of the working application can be added here.

Recommended screenshots:

1. Login page
2. Dashboard
3. Decision Management
4. Alternative Comparison
5. Document Management
6. Discussions / Comments
7. Decision Version History
8. Approval Workflow
9. Notifications
10. Audit Logs
11. Reports
12. FastAPI Swagger Documentation
13. Frontend Deployment
14. Backend Deployment
15. Render PostgreSQL Database

Example Markdown syntax:

```markdown
![Dashboard](screenshots/dashboard.png)
```

Create a `screenshots` directory in the repository and place the project screenshots there.

Example:

```text
screenshots/
├── login.png
├── dashboard.png
├── decisions.png
├── alternatives.png
├── documents.png
├── comments.png
├── version-history.png
├── approval.png
├── notifications.png
├── audit-logs.png
├── reports.png
├── swagger.png
└── deployment.png
```

---

# Major Workflow

A typical decision workflow is:

```text
Register / Login
       ↓
Create Decision
       ↓
Add Alternatives
       ↓
Add Documents / Comments
       ↓
Edit / Maintain Version History
       ↓
Submit for Approval
       ↓
Admin Review
       ↓
Approve / Reject
       ↓
Notification
       ↓
Audit Log
       ↓
Dashboard / Reports
```

---

# Security

The platform includes several security measures:

- JWT authentication
- Password hashing
- Protected backend endpoints
- Role-based access control
- Environment-based database configuration
- CORS configuration
- Separation of development and production configuration

Sensitive credentials should always be stored using environment variables and should never be committed to source control.

---

# GitHub Repository

Repository:

https://github.com/springboardmentor054-coder/Expert-Decision-Replay-Platform

Development branch:

```text
jyothi-chekka
```

---

# Future Enhancements

Possible future improvements include:

- AI-powered decision recommendations
- Semantic decision search
- AI-generated decision summaries
- Email notifications
- Multi-factor authentication
- Decision quality scoring
- PDF and Excel report export
- Real-time collaboration
- Advanced analytics
- Improved search and filtering
- Cloud-based document storage

---

# Team Members

Add the project team members here.

Example:

```text
Team Member 1 - Name
Team Member 2 - Name
Team Member 3 - Name
```

---

# Conclusion

The **Expert Decision Replay Platform** provides a centralized solution for capturing and preserving organizational decision knowledge.

By integrating decision management, alternatives, documents, discussions, version tracking, approval workflows, notifications, audit logs, reports, and analytics, the platform helps organizations maintain decision history and improve future decision-making.

The application has been containerized using Docker and deployed with a React frontend, FastAPI backend, and PostgreSQL database.

---

# License

This project was developed for academic and learning purposes.