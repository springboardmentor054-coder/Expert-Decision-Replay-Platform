# Expert Decision Replay Platform

A centralized decision management platform that helps organizations record, manage, review, and analyze important decisions. The platform preserves organizational knowledge by documenting decision-making processes, enabling teams to understand previous decisions, avoid repeating mistakes, and improve future decision quality.

---

## Features

### User Management
- User Registration & Login
- JWT Authentication
- Role-Based Access Control
- Team Management
- User Profile Management

### Decision Management
- Create, Update, Delete Decisions
- Decision Categories
- Decision Status Tracking
- File Attachments
- Version History

### Alternative Analysis
- Multiple Decision Alternatives
- Pros & Cons Comparison
- Cost Analysis
- Feasibility Analysis
- Risk Assessment

### Discussion Module
- Comments
- Discussion Threads
- Meeting Notes
- Decision Rationale
- Supporting Documents

### Approval Workflow
- Multi-Level Approval System
- Reviewer Assignment
- Approval History
- Notifications
- Escalation Management

### Knowledge Repository
- Decision Search
- Category Filtering
- Tag Management
- Timeline View
- Document Archive

### Dashboard
- Employee Dashboard
- Manager Dashboard
- Administrator Dashboard
- Decision Analytics
- Team Performance Reports

### Audit & Compliance
- Activity Logs
- Version Tracking
- Change History
- Access Logs
- Security Logs

### Reports
- Decision Reports
- Approval Reports
- Team Reports
- Audit Reports
- PDF Export
- Excel Export

---

## Tech Stack

### Backend
- Python
- FastAPI

### Database
- PostgreSQL
- SQLAlchemy
- Alembic

### Authentication
- JWT
- OAuth2

### Additional Libraries
- Pydantic
- Uvicorn
- Redis
- Python Dotenv
- Passlib
- Python-Jose

### Development Tools
- Git
- GitHub
- Docker
- Postman
- VS Code

---

## Project Structure

```
ExpertDecisionReplayPlatform/
│
├── app/
│   ├── api/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── migrations/
├── uploads/
├── reports/
├── tests/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env
├── README.md
└── .gitignore
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/ExpertDecisionReplayPlatform.git
cd ExpertDecisionReplayPlatform
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/decision_db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REDIS_HOST=localhost

REDIS_PORT=6379
```

---

## Database Migration

Initialize Alembic:

```bash
alembic init migrations
```

Create migration:

```bash
alembic revision --autogenerate -m "Initial migration"
```

Apply migration:

```bash
alembic upgrade head
```

---

## Running the Application

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Application URL:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

ReDoc Documentation:

```
http://127.0.0.1:8000/redoc
```

---

## User Roles

- Employee
- Reviewer
- Manager
- Administrator

---

## Decision Workflow

```
Create Decision
       ↓
Submit for Review
       ↓
Reviewer Evaluation
       ↓
Manager Approval
       ↓
Implementation
       ↓
Archived Decision
```

---

## API Modules

- Authentication
- User Management
- Decision Management
- Alternative Analysis
- Discussion Module
- Approval Workflow
- Reports
- Dashboard
- Audit Logs

---

## Performance Goals

- Fast Decision Retrieval
- Secure Authentication
- Efficient Approval Workflow
- Audit Trail Maintenance
- Scalable Architecture
- High Database Performance

---

## Future Enhancements

- AI-Based Decision Recommendations
- Email Notifications
- Real-Time Collaboration
- Mobile Application
- Cloud Deployment
- Analytics Dashboard
- Advanced Search
- Decision Prediction using Machine Learning

---

## Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## License

This project is developed for educational and learning purposes.

---

## Author

**V SAI CHARAN KUMAR REDDY**

Python Developer | FastAPI | PostgreSQL | Backend Development

---
