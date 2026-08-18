import pytest  # type: ignore
from datetime import timedelta
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

class TestSecurity:
    """Test suite for security utilities."""

    def test_hash_password(self):
        """Test password hashing."""
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > len(password)

    def test_verify_password_success(self):
        """Test password verification with correct password."""
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_failure(self):
        """Test password verification with incorrect password."""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = hash_password(password)
        assert verify_password(wrong_password, hashed) is False

    def test_create_access_token(self):
        """Test access token creation."""
        user_id = "123"
        token = create_access_token(subject=user_id)
        assert token is not None
        assert len(token) > 0

    def test_decode_access_token(self):
        """Test access token decoding."""
        user_id = "123"
        token = create_access_token(subject=user_id)
        payload = decode_access_token(token)
        assert payload["sub"] == user_id
        assert "exp" in payload

    def test_decode_invalid_token(self):
        """Test decoding invalid token."""
        with pytest.raises(ValueError):
            decode_access_token("invalid.token.here")

    def test_decode_expired_token(self):
        """Test decoding expired token."""
        user_id = "123"
        # Create token that expires immediately
        token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))
        with pytest.raises(ValueError, match="expired"):
            decode_access_token(token)

    def test_password_long_input(self):
        """Test password hashing with very long input."""
        # Passwords longer than 72 bytes should be truncated by bcrypt
        long_password = "a" * 100
        hashed = hash_password(long_password)
        assert verify_password(long_password, hashed) is True
        # Also verify that truncation works (first 72 chars match)
        assert verify_password("a" * 72, hashed) is True
