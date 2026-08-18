# Backend Quick Start Guide

## Prerequisites
- Python 3.11+
- pip or conda

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create .env file** (copy from .env.example):
   ```bash
   cp .env.example .env
   ```

3. **Default configuration uses SQLite** (no database setup needed):
   - Database file: `./dev.db` (auto-created)
   - Perfect for local development and testing

## Running the Backend

### Option 1: Development Server (with auto-reload)
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Option 2: Production Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Option 3: Using Python directly
```bash
python -m uvicorn app.main:app --reload
```

## Testing

Run all tests:
```bash
pip install -r requirements-dev.txt
pytest
```

Run specific test:
```bash
pytest tests/test_auth.py -v
```

## Access Points

Once running:
- **API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/api/docs
- **ReDoc**: http://127.0.0.1:8000/api/redoc
- **Health Check**: http://127.0.0.1:8000/api/healthz

## Using PostgreSQL

To use PostgreSQL instead of SQLite:

1. **Update .env:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/expert_decision_replay
   ```

2. **Make sure PostgreSQL is running** and the database exists

3. **Restart the backend**

## Troubleshooting

### Database connection error
- Check `.env` file has correct `DATABASE_URL`
- For SQLite: File will be created automatically
- For PostgreSQL: Ensure database server is running

### Port already in use
- Change port: `uvicorn app.main:app --port 8001`
- Or kill process using port 8000

### Import errors
- Ensure you're in the backend directory
- Verify virtual environment is activated
- Run: `pip install -r requirements.txt`

## Environment Variables

- `DATABASE_URL` - Database connection string
- `SESSION_SECRET` - Secret key for JWT tokens
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

## Production Deployment

See `../DOCKER_DEPLOYMENT.md` for Docker deployment instructions.
