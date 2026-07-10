"""
Expert Decision Replay Platform — API entrypoint.

Milestone 1: Authentication + User Management (roles, teams, profiles)
Milestone 2: Decision Management, Alternative Analysis, Discussion Module,
             Document Management, and automatic Version Tracking.

Run locally:
    uvicorn app.main:app --reload

Interactive API docs: http://127.0.0.1:8000/docs
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine, SessionLocal
from app.config import settings
from app.models import User, UserRole
from app.security import hash_password
from app.routers import auth, users, decisions, alternatives, discussions, documents

app = FastAPI(
    title="Expert Decision Replay Platform API",
    description="Centralized platform for recording, reviewing, and learning from organizational decisions.",
    version="0.2.0",
)

# CORS — open for local development; restrict allow_origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    Base.metadata.create_all(bind=engine)

    # Convenience bootstrap: create a default administrator on first run if
    # no users exist yet, so the API is usable immediately without extra setup.
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            admin = User(
                full_name="System Administrator",
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMINISTRATOR,
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Expert Decision Replay Platform API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(decisions.router)
app.include_router(alternatives.router)
app.include_router(discussions.router)
app.include_router(documents.router)
