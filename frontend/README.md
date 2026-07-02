# Frontend Portal Configuration Guide - EDRP

Welcome to the frontend application codebase for the **Expert Decision Replay Platform (EDRP)**. This client portal is built with React 19, Vite, TypeScript, and Tailwind CSS.

---

## 1. Local Development Setup

### 1.1 Prerequisites
Ensure you have the following installed on your machine:
- **Node.js 20+**
- **NPM**

### 1.2 Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```

---

## 2. Running the Portal Client

1. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
2. Configure settings inside `.env` to point to the backend API server:
   ```ini
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_ENVIRONMENT=development
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will launch at `http://localhost:5173`.*

---

## 3. Building for Production

Compile static assets optimized for production deployments:
```bash
npm run build
```
- The output bundle will be generated in the `/dist` directory.
- Test the production build locally:
  ```bash
  npm run preview
  ```

---

## 4. Running the Tests

Execute tests using Vitest:
```bash
# Run tests
npm run test

# Run tests with coverage
npm run coverage
```

---

## 5. Directory Layout Reference

```tree
frontend/
├── src/
│   ├── assets/                 # Global styles and static vectors
│   ├── components/             # Reusable UI component blocks (Buttons, Inputs, etc.)
│   ├── context/                # Authentication & Theme context providers
│   ├── features/               # Feature-sliced application code (Auth, Decisions)
│   ├── hooks/                  # Global hooks
│   ├── routes/                 # Navigation definitions & Route Guarding
│   ├── services/               # Axios client wrappers
│   └── types/                  # Shared TypeScript type definitions
└── tailwind.config.js          # Tailwind CSS configurations
```

---

## 6. Troubleshooting Common Errors

### 6.1 API Request Failures
- **Error:** `AxiosError: Network Error / connection refused...`
- **Resolution:** Verify the backend API server is active at the address in `VITE_API_URL` (default: `http://localhost:8000/api/v1`). Check backend logs for server-side exceptions.

### 6.2 Node Version Conflicts
- **Error:** `Unsupported engine...` or node module parsing errors during compile.
- **Resolution:** Ensure you are using Node.js version 20 or newer. Check your active Node.js version using `node -v`. We recommend using Node Version Manager (`nvm`) to switch between Node versions.
