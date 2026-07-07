# ExpertDecisionReplayPlatform

ExpertDecisionReplayPlatform is a full-stack decision replay platform scaffold with a Python backend and a frontend starter. The project is organized to support authentication, decision management, approvals, discussions, reporting, and administration features.

## Project Structure

- Backend: [backend](backend)
- Frontend: [frontend](frontend)
- Database scripts: [database](database)
- Documentation: [docs](docs)
- Tests: [testing](testing)

## Requirements

Python dependencies are listed in [requirements.txt](requirements.txt).

Install them with:

```bash
pip install -r requirements.txt
```

## Run the Backend

From the project root, start the backend server:

```bash
cd backend
python app/main.py
```

The backend will be available at:

- http://127.0.0.1:8000
- Health endpoint: http://127.0.0.1:8000/api/health

## Run the Frontend

From the project root, start a simple static server:

```bash
cd frontend
python -m http.server 3000
```

Then open:

- http://127.0.0.1:3000

## Notes

This repository currently contains a functional scaffold and placeholder modules for the planned application. You can expand the API, models, services, and UI as the platform grows.

