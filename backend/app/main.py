import logging
import os
import json
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from app import models  # noqa: F401
from app.database.session import Base, engine
from app.routers import (alternatives, approvals, audit_logs, auth, comments,
                          decisions, documents, notifications, reports, roles,
                          users, versions, voice_recordings)

logging.basicConfig(level=logging.INFO)
Base.metadata.create_all(bind=engine)

# Custom JSON response with pretty printing
class PrettyJSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=2,
            separators=(",", ": "),
        ).encode("utf-8")

app = FastAPI(
    title="Expert Decision Replay Platform",
    description="Full-stack platform for expert decision management with version tracking, audit logs, notifications, and voice recording.",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    default_response_class=PrettyJSONResponse,
)

cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
try:
    allow_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
except Exception:
    allow_origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(decisions.router)
app.include_router(alternatives.router)
app.include_router(approvals.router)
app.include_router(comments.router)
app.include_router(documents.router)
app.include_router(versions.router)
app.include_router(audit_logs.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(voice_recordings.router)

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@app.get("/api/healthz", tags=["Health"])
def healthz():
    return {"status": "ok", "version": "2.0.0"}

@app.get("/", tags=["Info"])
def root():
    return {
        "name": "Expert Decision Replay Platform",
        "version": "2.0.0",
        "status": "running",
        "documentation": "http://127.0.0.1:8000/api/docs",
        "health_check": "http://127.0.0.1:8000/api/healthz",
    }

@app.get("/api", tags=["Info"])
def api_info():
    return {
        "api_name": "Expert Decision Replay Platform API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/api/healthz",
            "docs": "/api/docs",
            "redoc": "/api/redoc",
            "auth": "/api/auth",
            "users": "/api/users",
            "decisions": "/api/decisions",
        },
    }
