# Backend Database Fix - Complete Guide

## Problem Fixed

**Error:**
```
TypeError: Invalid argument(s) 'pool_class' sent to create_engine(), using configuration PGDialect_psycopg2/QueuePool/Engine.
```

**Root Cause:**
The SQLAlchemy 2.0+ API doesn't accept `pool_class` as a keyword argument directly. The parameter name should be `poolclass` (lowercase) for SQLite, and for PostgreSQL, we should use proper connection pool configuration.

## Solution Applied

### File: `backend/app/database/session.py`

**Before:**
```python
pool_class = NullPool if "sqlite" in DATABASE_URL else QueuePool
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_class=pool_class,  # ❌ Wrong parameter name
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
```

**After:**
```python
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,  # ✓ Correct parameter for SQLite
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,  # ✓ Proper PostgreSQL configuration
    )
```

## Database Configuration

### Default (Local Development): SQLite
- **File:** `backend/.env`
- **Value:** `DATABASE_URL=sqlite:///./dev.db`
- **Advantages:**
  - No external database setup needed
  - Perfect for local development and testing
  - Database file auto-created as `dev.db`

### Production: PostgreSQL
- **Update `.env`:**
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/expert_decision_replay
  ```
- **Ensure PostgreSQL is running** before starting the backend

## Getting Started

### Quick Start (Windows)
```bash
cd backend
run.bat
```

### Quick Start (Linux/Mac)
```bash
cd backend
chmod +x run.sh
./run.sh
```

### Manual Start
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Verify Setup
```bash
cd backend
python verify_setup.py
```

## Access Points

Once running:
- **API:** http://127.0.0.1:8000
- **Swagger Docs:** http://127.0.0.1:8000/api/docs
- **ReDoc:** http://127.0.0.1:8000/api/redoc
- **Health Check:** http://127.0.0.1:8000/api/healthz

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | SQLite or PostgreSQL connection string |
| `SESSION_SECRET` | No | random | JWT token signing key |
| `CORS_ORIGINS` | No | localhost | Comma-separated list of allowed origins |

## Files Modified

✅ `backend/app/database/session.py` - Fixed SQLAlchemy pool configuration
✅ `backend/.env` - Changed to SQLite for local development
✅ `backend/.env.example` - Added both SQLite and PostgreSQL options

## Files Created

✨ `backend/run.bat` - Windows startup script
✨ `backend/run.sh` - Linux/Mac startup script
✨ `backend/verify_setup.py` - Verification script
✨ `backend/QUICKSTART.md` - Quick start guide

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Ensure `.env` file exists in the backend directory
- Copy from `.env.example` if missing: `cp .env.example .env`

### Error: "Database connection refused"
- If using PostgreSQL, ensure it's running and accessible
- Switch to SQLite for local development (simpler setup)

### Error: "Port 8000 is already in use"
```bash
uvicorn app.main:app --port 8001  # Use different port
```

### Error: "Module not found" or import errors
```bash
pip install -r requirements.txt  # Reinstall dependencies
```

## Testing

Run tests:
```bash
pip install -r requirements-dev.txt
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Next Steps

1. ✅ Start the backend with `run.bat` (Windows) or `run.sh` (Linux/Mac)
2. ✅ Verify it works: http://127.0.0.1:8000/api/healthz
3. ✅ View API docs: http://127.0.0.1:8000/api/docs
4. ✅ For production, update `.env` with PostgreSQL connection details

## Support

For more information:
- See `QUICKSTART.md` for detailed setup instructions
- See `../DOCKER_DEPLOYMENT.md` for Docker setup
- See `../TESTING.md` for running tests
