import pytest  # type: ignore
from fastapi import status

class TestHealth:
    """Test suite for health check endpoints."""

    def test_healthz(self, client):
        """Test health check endpoint."""
        response = client.get("/api/healthz")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data
