import os
import sys
import pytest  # type: ignore
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

# Add backend app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.database.session import Base
from app.utils.deps import get_db

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def db() -> Session:
    """Provide a test database session."""
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    yield db_session
    db_session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client() -> TestClient:
    """Provide a test client."""
    return TestClient(app)

@pytest.fixture
def test_user_data():
    """Provide test user data."""
    return {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "TestPassword123!",
        "role_id": 1
    }

@pytest.fixture
def test_admin_data():
    """Provide test admin data."""
    return {
        "full_name": "Admin User",
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "role_id": 1
    }
