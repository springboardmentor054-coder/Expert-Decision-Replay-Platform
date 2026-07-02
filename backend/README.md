# Backend Services Configuration Guide - EDRP

Welcome to the backend API services codebase for the **Expert Decision Replay Platform (EDRP)**. This service is built with Python 3.11 using **FastAPI**, with PostgreSQL for storage and Redis for caching.

---

## 1. Local Development Setup

### 1.1 Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.11+**
- **PostgreSQL** & **Redis** (or Docker to run them containerized)

### 1.2 Virtual Environment & Dependencies Setup
1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Linux/macOS:**
     ```bash
     source venv/bin/activate
     ```
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 2. Configuration & Environment Setup

1. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
2. Configure settings inside `.env` (database connection URLs, JWT keys, and S3 credentials):
   ```ini
   DATABASE_URL=postgresql://edrp_user:edrp_password@localhost:5432/edrp_dev
   REDIS_URL=redis://localhost:6379/0
   JWT_SECRET_KEY=generate_a_secure_jwt_secret_key_here
   AWS_ACCESS_KEY_ID=mock_key
   AWS_SECRET_ACCESS_KEY=mock_secret
   S3_BUCKET_NAME=edrp-dev-bucket
   ```

---

## 3. Database Migrations (Alembic)

The database schema is managed via Alembic.
1. Run outstanding migrations to update your local database schema:
   ```bash
   alembic upgrade head
   ```
2. Generate a new database migration after modifying SQLAlchemy models:
   ```bash
   alembic revision --autogenerate -m "Describe your schema adjustments"
   ```

---

## 4. Running the API Server

Start the development server using Uvicorn with auto-reload enabled:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **API Documentation:**
  - Swagger UI: `http://localhost:8000/docs`
  - ReDoc UI: `http://localhost:8000/redoc`

---

## 5. Running the Test Suite

Execute tests using `pytest` inside the virtual environment:
```bash
# Run all backend tests
pytest

# Run tests with coverage report
pytest --cov=app tests/
```

---

## 6. Directory Layout Reference

```tree
backend/
├── alembic/                    # Schema migrations scripts
├── app/
│   ├── api/                    # Endpoint routers and dependency injection
│   ├── core/                   # Global configuration settings & database setup
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic schema validation DTOs
│   ├── repositories/           # Database access patterns
│   ├── services/               # Business logic services
│   └── main.py                 # Application bootstrap entrypoint
├── tests/                      # Pytest automation scripts
└── requirements.txt            # Python package dependencies
```

---

## 7. Troubleshooting Common Errors

### 7.1 Database Connection Failures
- **Error:** `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) could not connect to server...`
- **Resolution:** Ensure the PostgreSQL service is active. If running via Docker Compose, run `docker compose ps` to check if the database container is healthy. Verify the database credentials in `.env` match your database configurations.

### 7.2 Cache Connection Failures
- **Error:** `redis.exceptions.ConnectionError: Error 111 connecting to localhost:6379...`
- **Resolution:** Ensure the Redis server container is active on port 6379. Run `redis-cli ping` to test local cache availability.
