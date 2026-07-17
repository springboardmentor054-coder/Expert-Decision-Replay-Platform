# Expert Decision Replay Platform — Frontend Setup

## What this is
A React app (built with `create-react-app`, matching your mentor's exact
commands) with:
- Login / Register pages
- Dashboard listing all decisions, with a form to create new ones
- Decision detail page: view/add alternatives, request approvals, approve/reject

## 1. Copy files into your project
Unzip `edrp_frontend.zip`. Copy the contents of the extracted `frontend/`
folder into the `frontend/` folder you already created (merge/replace).

## 2. Install dependencies
```
cd frontend
npm install
```
This installs React plus `react-router-dom` and `axios` (already listed in
package.json).

## 3. Make sure your backend is running first
In a **separate terminal**, your backend should already be running on
`http://localhost:8000` (same as before):
```
cd backend
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL="sqlite:///./edrp.db"
uvicorn app.main:app --reload
```

## 4. Run the frontend
Back in the `frontend` folder, in a new terminal:
```
npm start
```
This opens `http://localhost:3000` automatically in your browser.

## 5. Try it out
1. Click "Create an account" — register as an Admin (or any role)
2. Log in
3. Click "+ New decision" and create one
4. Click into a decision, add an alternative
5. Register a second account (different browser tab / incognito), then as
   Admin, request an approval assigning that user's ID
6. Log in as that second user, click "Approve" — watch the status update

## Notes
- The frontend expects the backend at `http://localhost:8000`. If you run
  the backend on a different port, create a `.env` file in `frontend/` with:
  ```
  REACT_APP_API_URL=http://localhost:YOUR_PORT
  ```
- To find a user's ID for assigning approvals, use the `GET /api/users`
  endpoint in your backend's `/docs` page (Admin/Manager only).
