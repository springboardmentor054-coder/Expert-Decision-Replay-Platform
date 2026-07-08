# Expert Decision Replay Platform

## Objective

The Expert Decision Replay Platform is a centralized application designed to record, manage, and replay important organizational decisions. The platform helps organizations preserve decision-making knowledge by documenting problem statements, alternatives, discussions, approvals, implementation status, and final outcomes.

---

## Project Description

The system enables organizations to review historical decisions, understand the reasoning behind them, and improve future decision-making processes. It provides structured decision management, collaboration tools, approval workflows, reporting capabilities, and audit tracking.

---

## Key Features

* User Authentication
* User Management
* Decision Management
* Alternative Analysis
* Discussion Module
* Approval Workflow
* Knowledge Repository
* Dashboard and Reports
* Audit Logs

---

## User Roles

* Employee
* Reviewer
* Manager
* Administrator

---

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

### Frontend

* React.js

### Database

* PostgreSQL

### Authentication

* JWT Authentication
* OAuth2 Password Flow

### Development Tools

* Git
* GitHub
* Postman
* VS Code

---

## Project Structure

```text
Expert-Decision-Replay-Platform/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── database.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── database/
│   ├── Decision_Replay_ER_Diagram.drawio
│   └── Decision_Replay_ER_Diagram.png
│
├── docs/
├── README.md
├── users.md
└── features.md
```

---

## Milestone 1 Progress

### Requirement Analysis

* Identified project objectives and requirements.
* Finalized project modules and user roles.

### ER Diagram

* Designed the Entity Relationship Diagram for the platform.
* Defined relationships between core entities.

### Database Design

* Finalized PostgreSQL database schema.
* Created tables and relationships for the application.

### FastAPI Backend Initialization

* Initialized FastAPI project structure.
* Configured database connectivity using SQLAlchemy.

### React Frontend Initialization

* Initialized React application for frontend development.

### Authentication Module

* Implemented JWT-based user registration and login.
* Secured API endpoints using token authentication.

### User Management Module

* Implemented user creation and retrieval functionality.
* Added role support for users.

---

## Database Tables

* Users
* Roles
* Teams
* Decision Categories
* Decisions
* Alternatives
* Risk Assessments
* Discussion Threads
* Comments
* Approvals
* Notifications
* Documents
* Audit Logs

---

## API Features Completed

* User Registration API
* User Login API
* JWT Token Generation
* User Retrieval API

---

## ER Diagram

The ER Diagram files are available in the `database` folder:

* `Decision_Replay_ER_Diagram.drawio`
* `Decision_Replay_ER_Diagram.png`

---

## Expected Outcome

* Centralized decision management platform
* Secure role-based authentication system
* Multi-level approval workflow
* Collaborative decision discussions
* Decision history and audit tracking
* Reporting and analytics dashboard
* Scalable and maintainable architecture

---

## Current Status

✅ Requirement Analysis Completed
✅ ER Diagram Completed
✅ Database Finalized
✅ FastAPI Project Initialized
✅ React Project Initialized
✅ Authentication Module Completed
✅ User Management Module Completed

**Milestone 1 Successfully Completed**
