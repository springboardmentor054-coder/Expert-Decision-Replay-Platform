# Expert Decision Replay Platform

A full-stack web application for managing expert decisions with authentication, decision management, alternative comparison, approval workflows, version history, document management, discussions, notifications, voice recordings, audit logs, and reports.

## Tech Stack

### Backend
- FastAPI
- Python
- PostgreSQL
- SQLAlchemy
- JWT Authentication

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Deployment
- Docker
- Docker Compose
- Nginx
- PostgreSQL

## Features

- User Registration and Login
- JWT-based Authentication
- Role-Based Access Control
- User Management
- Decision Management
- Alternative Analysis and Comparison
- Approval Workflow
- Decision Version History
- Document Management
- Discussions and Comments
- Notifications
- Voice Recordings
- Audit Logs
- Reports and Dashboard

## User Roles

The platform provides the following roles:

- **Admin** – Full access to the platform, including user management, reports, and audit logs.
- **Approver** – Can review and approve or reject decisions.
- **Contributor** – Can create decisions and propose alternatives.
- **Viewer** – Has read-only access to decisions.

## Project Structure

```text
Expert-Decision-Replay-Platform/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── utils/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── seed_roles.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── test/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── nginx.conf
├── README.md
└── .gitignore
```

## Docker Deployment

The application is deployed using Docker Compose with the following services:

- **PostgreSQL** – Database
- **FastAPI Backend** – REST API
- **React Frontend** – User interface
- **Nginx** – Reverse proxy

### Start the Application

```bash
docker compose --profile with-nginx up -d --build
```

### Check Running Containers

```bash
docker ps
```

The required containers should be running and healthy.

### Health Check

```bash
curl.exe -i http://localhost/api/healthz
```

Expected response:

```json
{
  "status": "ok",
  "version": "2.0.0"
}
```

### Application URL

```text
http://localhost
```

### API Documentation

Swagger API documentation is available at:

```text
http://localhost/api/docs
```

## Database Roles

The default roles can be created using:

```bash
docker exec edp-backend python seed_roles.py
```

The default roles are:

- Admin
- Approver
- Contributor
- Viewer

## Testing

Testing was performed for the backend APIs and application functionality.

The backend test files are available in:

```text
backend/tests/
```

The deployed application was also verified using the health-check API:

```text
/api/healthz
```

## Milestone 4

### Tasks Completed

- Testing
- Bug Fixing
- Docker Deployment
- Documentation
- Final GitHub Upload

### Week 8 Outcomes

- Production-ready platform
- Successful Docker deployment
- Testing completed
- Complete project documentation
- Project uploaded to GitHub

## Deployment Status

| Task | Status |
|---|---|
| Testing | Completed |
| Bug Fixing | Completed |
| Docker Deployment | Completed |
| Documentation | Completed |
| GitHub Upload | Completed |

## Project Status

The Expert Decision Replay Platform has successfully completed the Milestone 4 activities, including testing, bug fixing, Docker deployment, documentation, and GitHub upload.

## Security

Do not commit passwords, API keys, access tokens, or other sensitive information to GitHub.

Use environment variables and `.env` files for local configuration. The `.env.example` file can be used as a configuration template.