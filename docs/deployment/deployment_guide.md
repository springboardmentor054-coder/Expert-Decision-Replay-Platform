# Deployment & DevOps Guide - EDRP

* **File Name:** `deployment_guide.md`
* **Folder Location:** `docs/deployment/`
* **Purpose:** Define containerization parameters, deployment environments, system environment configurations, and GitHub Actions CI/CD workflows.

---

## 1. Deployment Architecture Overview

The system is fully containerized to run identically in development, testing, and production environments using **Docker** and **Docker Compose**.

```
                           +----------------------+
                           |   HTTP/WSS Request   |
                           +----------------------+
                                      |
                                      v
                           +----------------------+
                           |  Nginx Reverse Proxy | (Port 80/443)
                           +----------------------+
                                  /        \
                    /static assets          /api requests
                                /            \
                               v              v
                  +------------------+   +------------------+
                  |  Frontend SPA    |   |  Uvicorn Node    | (Port 8000)
                  |  (Vite static)   |   |  (FastAPI App)   |
                  +------------------+   +------------------+
                                           /        |       \
                                          v         v        v
                                    +--------+ +--------+ +--------+
                                    | Postgres| | Redis  | | AWS S3 |
                                    +--------+ +--------+ +--------+
```

---

## 2. Docker Architecture Configurations

### 2.1 Backend Dockerfile (`backend/Dockerfile`)
Production-grade multi-stage build configuration to minimize image footprint and maximize security:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime image
FROM python:3.11-slim as runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
COPY . /app

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.2 Frontend Dockerfile (`frontend/Dockerfile`)
Production-grade Multi-stage Nginx build:

```dockerfile
# Stage 1: Build React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Local Multi-Container Development (`docker-compose.yml`)

The complete application stack can be launched locally using the following orchestration file:

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    container_name: edrp-db
    restart: always
    environment:
      POSTGRES_USER: edrp_user
      POSTGRES_PASSWORD: edrp_password
      POSTGRES_DB: edrp_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edrp_user -d edrp_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: edrp-cache
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edrp-backend
    restart: always
    environment:
      - DATABASE_URL=postgresql://edrp_user:edrp_password@database:5432/edrp_dev
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET_KEY=dev_secret_key_change_me_in_production_12345
      - AWS_ACCESS_KEY_ID=mock_key
      - AWS_SECRET_ACCESS_KEY=mock_secret
      - S3_BUCKET_NAME=edrp-dev-bucket
    ports:
      - "8000:8000"
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: edrp-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 4. Key Environment Variables Configuration

| Variable | Scope | Purpose / Default Value |
| :--- | :---: | :--- |
| `ENV` | Global | Runtime environment (`development`, `staging`, `production`) |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `REDIS_URL` | Backend | Redis cache URI |
| `JWT_SECRET_KEY` | Backend | Cryptographic key for signing JWTs |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Backend | Lifetime of Access Tokens (default: `15`) |
| `AWS_ACCESS_KEY_ID` | Backend | AWS S3 upload/download credentials |
| `AWS_SECRET_ACCESS_KEY` | Backend | AWS S3 upload/download credentials |
| `S3_BUCKET_NAME` | Backend | Name of S3 storage target bucket |
| `VITE_API_URL` | Frontend | Target API server gateway (`https://api.edrp.org/api/v1`) |

---

## 5. CI/CD Pipeline (GitHub Actions)

Workflow configuration (`.github/workflows/ci-cd.yml`) to automatically test, build, and check quality constraints.

```yaml
name: EDRP CI/CD Pipeline

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  backend-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt pytest pytest-cov bandit

      - name: Code Quality Scan (Bandit)
        run: |
          cd backend
          bandit -r app/

      - name: Run Backend Tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml

  frontend-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run Linter & Typechecks
        run: |
          cd frontend
          npm run lint
          npm run typecheck

      - name: Run Vitest Unit Tests
        run: |
          cd frontend
          npm run test
```
