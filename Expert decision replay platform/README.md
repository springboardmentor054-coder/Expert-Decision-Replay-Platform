# Expert Decision Replay Platform

## Objective

The Expert Decision Replay Platform is a centralized application designed to record, manage, and replay important organizational decisions. It helps organizations preserve decision-making knowledge by documenting problem statements, alternatives, discussions, approvals, implementation status, and final outcomes.

## Project Description

The platform enables employees and organizations to review past decisions, understand the reasoning behind them, and make better decisions in the future. It supports structured decision management, collaboration, approval workflows, reporting, and audit tracking.

## Key Features

- Authentication
- Decision Management
- Alternative Analysis
- Discussion Module
- Approval Workflow
- Knowledge Repository
- Dashboard
- Reports
- Audit Logs

## User Roles

- Employee
- Reviewer
- Manager
- Administrator

## Tech Stack

### Backend
- Python
- FastAPI

### Frontend
- Tkinter / PyQt / Flask

### Database
- PostgreSQL
- Redis

### Authentication
- JWT
- OAuth2

### Backend Libraries
- SQLAlchemy
- Alembic
- Pydantic
- Uvicorn

### DevOps
- Docker
- GitHub
- GitHub Actions
- Postman

## Project Structure

```
Expert-Decision-Replay-Platform/
│
├── backend/
├── frontend/
├── database/
├── docs/
├── screenshots/
├── testing/
├── README.md
├── users.md
└── features.md
```

## Expected Outcome

- Centralized decision management
- Secure role-based authentication
- Multi-level approval workflow
- Collaboration through discussions
- Decision history and audit logs
- Reports and analytics dashboard
- Docker-based deployment

## Database Design

The database for the Expert Decision Replay Platform has been designed.

### Tables
- Users
- Roles
- Teams
- Decision Categories
- Decisions
- Alternatives
- Risk Assessments
- Discussion Threads
- Comments
- Approvals
- Notifications
- Documents
- Audit Logs

### ER Diagram
The ER Diagram is available in the `database` folder:
- Decision_Replay_ER_Diagram.drawio
- Decision_Replay_ER_Diagram.png