# Contributing to EDRP

Thank you for contributing to the **Expert Decision Replay Platform (EDRP)**! This document outlines the setup workflows, branching strategies, and testing requirements to get your development environment running quickly.

---

## 1. Local Development Setup

### 1.1 Prerequisites
Ensure you have the following installed on your machine:
- **Docker & Docker Compose** (Highly recommended to run database and caching services).
- **Python 3.11+** (for local backend development).
- **Node.js 20+ & NPM** (for local frontend development).

---

### 1.2 Step-by-Step Repository Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/organization/Expert-Decision-Replay-Platform.git
cd Expert-Decision-Replay-Platform
```

#### Step 2: Spin Up Infrastructure (Docker)
In the root directory, start the PostgreSQL and Redis containers:
```bash
docker compose up -d database redis
```

#### Step 3: Run the Backend Services
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and initialize settings:
   ```bash
   cp .env.example .env
   ```
5. Execute database migrations:
   ```bash
   alembic upgrade head
   ```
6. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The Swagger API documentation will be available at `http://localhost:8000/docs`.*

#### Step 4: Run the Frontend Application
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The web application will launch at `http://localhost:5173`.*

---

## 2. Standard Development Lifecycle

When working on a ticket or task, follow these steps:

### 2.1 Branch Creation
Create your local task branch from the latest `develop` branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/EDRP-XYZ-feature-name
```

### 2.2 Quality & Coding Rules
- Ensure your code conforms to the specifications in [coding_standards.md](file:///home/mozhi/Expert-Decision-Replay-Platform/Expert-Decision-Replay-Platform/docs/development/coding_standards.md).
- Run linting and formatting tools locally:
  ```bash
  # Backend
  black app/
  flake8 app/
  
  # Frontend
  npm run lint
  npm run format
  ```

### 2.3 Committing & Pushing
Use Conventional Commits syntax when committing changes:
```bash
git add .
git commit -m "feat(decisions): implement alternative deletion logic"
git push origin feature/EDRP-XYZ-feature-name
```

### 2.4 Creating a Pull Request
1. Open a Pull Request targets the `develop` branch on GitHub.
2. Complete the Pull Request template, listing the ticket ID and describing the changes.
3. Verify that the GitHub Actions pipeline runs and all tests and quality checks pass.
4. Request reviews from team leads or peers.

---

## 3. Code Review & Approval Gateways

- Every PR requires at least one positive review from a repository owner or peer to merge.
- If changes are requested during review, resolve them, commit the updates, and push to your branch to update the PR automatically.
- Merges into the integration branches utilize the **Squash and Merge** strategy to maintain a clean git history.
