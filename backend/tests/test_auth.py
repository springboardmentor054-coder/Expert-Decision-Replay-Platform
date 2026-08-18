import pytest  # type: ignore
from fastapi import status
from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.user import User
from app.utils.security import hash_password

@pytest.mark.asyncio
class TestAuth:
    """Test suite for authentication endpoints."""

    @pytest.fixture(autouse=True)
    def setup(self, db: Session):
        """Setup test data."""
        # Create default role
        role = Role(name="User", description="Regular user")
        db.add(role)
        db.commit()
        db.refresh(role)
        self.role_id = role.id

    def test_register_user(self, client, db: Session):
        """Test user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "full_name": "New User",
                "email": "newuser@example.com",
                "password": "Password123!",
                "role_id": self.role_id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"

    def test_register_duplicate_email(self, client, db: Session):
        """Test registration with duplicate email."""
        # First registration
        client.post(
            "/api/auth/register",
            json={
                "full_name": "User 1",
                "email": "duplicate@example.com",
                "password": "Password123!",
                "role_id": self.role_id
            }
        )
        # Second registration with same email
        response = client.post(
            "/api/auth/register",
            json={
                "full_name": "User 2",
                "email": "duplicate@example.com",
                "password": "Password123!",
                "role_id": self.role_id
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already registered" in response.json()["detail"]

    def test_register_invalid_role(self, client):
        """Test registration with invalid role."""
        response = client.post(
            "/api/auth/register",
            json={
                "full_name": "User",
                "email": "user@example.com",
                "password": "Password123!",
                "role_id": 999
            }
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_success(self, client, db: Session):
        """Test successful login."""
        # Create a user
        user = User(
            full_name="Login Test",
            email="login@example.com",
            hashed_password=hash_password("Password123!"),
            role_id=self.role_id
        )
        db.add(user)
        db.commit()

        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "email": "login@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_email(self, client):
        """Test login with invalid email."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "Password123!"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_invalid_password(self, client, db: Session):
        """Test login with invalid password."""
        # Create a user
        user = User(
            full_name="User",
            email="user@example.com",
            hashed_password=hash_password("CorrectPassword123!"),
            role_id=self.role_id
        )
        db.add(user)
        db.commit()

        # Try to login with wrong password
        response = client.post(
            "/api/auth/login",
            json={
                "email": "user@example.com",
                "password": "WrongPassword123!"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_read_current_user(self, client, db: Session):
        """Test reading current user info."""
        # Create a user
        user = User(
            full_name="Current User",
            email="current@example.com",
            hashed_password=hash_password("Password123!"),
            role_id=self.role_id
        )
        db.add(user)
        db.commit()

        # Login to get token
        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "current@example.com",
                "password": "Password123!"
            }
        )
        token = login_response.json()["access_token"]

        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "current@example.com"

    def test_access_without_token(self, client):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/auth/me")
        assert response.status_code == status.HTTP_403_FORBIDDEN
