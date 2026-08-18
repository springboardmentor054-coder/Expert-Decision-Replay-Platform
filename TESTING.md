# Testing Guide

## Backend Testing

### Setup

1. **Install development dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   ```

2. **Run tests:**
   ```bash
   pytest
   ```

3. **Run tests with coverage:**
   ```bash
   pytest --cov=app --cov-report=html
   ```

4. **Run specific test file:**
   ```bash
   pytest tests/test_auth.py
   ```

5. **Run with verbose output:**
   ```bash
   pytest -v
   ```

### Test Structure

- `tests/test_auth.py` - Authentication endpoints (register, login, user info)
- `tests/test_security.py` - Security utilities (password hashing, token creation/decoding)
- `tests/test_health.py` - Health check endpoint

### Writing New Tests

Example test structure:
```python
import pytest
from fastapi import status

@pytest.mark.asyncio
class TestMyFeature:
    def test_should_do_something(self, client):
        response = client.get("/api/my-endpoint")
        assert response.status_code == status.HTTP_200_OK
```

## Frontend Testing

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Run tests in UI mode:**
   ```bash
   npm run test:ui
   ```

4. **Generate coverage report:**
   ```bash
   npm run test:coverage
   ```

### Test Structure

- `src/test/api.test.ts` - API integration tests
- `src/test/App.test.tsx` - App component tests

### Writing New Tests

Example test structure:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeDefined()
  })
})
```

## CI/CD Integration

### Running Tests Before Commit

Use git hooks:
```bash
# Backend
pytest before commit

# Frontend
npm test before commit
```

### Docker Testing

Run tests in Docker:
```bash
# Backend
docker-compose run --rm backend pytest tests/

# Frontend
docker-compose run --rm frontend npm test
```

## Test Coverage Goals

- Backend: Minimum 70% coverage
- Frontend: Minimum 60% coverage

## Known Limitations

- Frontend tests are basic and focus on component rendering
- Database tests use SQLite for speed
- Integration tests with real API calls should be added for production
