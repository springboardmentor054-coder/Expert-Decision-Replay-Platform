# Expert Decision Replay Platform

A full-stack web application for managing expert decisions with version tracking, document management, audit logs, notifications, voice recording, and comprehensive reporting.

## Tech Stack

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy + JWT Auth
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (password: `Nani@9425`)

### 1. Create PostgreSQL Database
```sql
CREATE DATABASE expert_decision_replay;
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python seed_roles.py
uvicorn app.main:app --reload --port 8000
```
Backend runs at: http://localhost:8000  
Swagger docs at: http://localhost:8000/api/docs

### 3. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## Default .env (backend/.env)
```
DATABASE_URL=postgresql://postgres:Nani%409425@localhost:5432/expert_decision_replay
SESSION_SECRET=expert-decision-replay-super-secret-key-2024
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Features

| Module | Description |
|--------|-------------|
| Authentication | JWT login/register with role-based access |
| Decision Management | Create, Edit, Delete, View decisions |
| Alternatives | Add & compare alternatives with cost/risk/feasibility |
| Approvals | Request and track decision approvals |
| Document Management | Upload PDF/DOCX/XLSX/PNG/JPG (max 20MB) |
| Discussions | Comments and meeting notes per decision |
| Version History | Automatic version snapshots on every change |
| Voice Recordings | Upload audio files; admins reply immediately |
| Notifications | Auto-created for key events; mark read/unread |
| Reports | Decision/Approval/Team/Audit reports with CSV export |
| Audit Logs | Immutable trail of all system actions |
| User Management | Activate/deactivate users, change roles |

## Roles

- **Admin**: Full access including audit logs, reports, and admin replies
- **Approver**: Can review and approve/reject decisions
- **Contributor**: Can create decisions and add alternatives
- **Viewer**: Read-only access
