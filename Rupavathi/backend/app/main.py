from dotenv import load_dotenv

load_dotenv()

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.connection import engine, Base, SessionLocal
from app.models import user, decision, role, category, alternative, document, comment, meeting_note, decision_version, notification, access_log, approval, audit_log
from app.models.category import Category
from app.models.role import Role
from app.routers.user_router import router as user_router
from app.routers.decision_router import router as decision_router
from app.routers.auth_router import router as auth_router
from app.routers.role_router import router as role_router
from app.routers.category_router import router as category_router
from app.routers.alternative_router import router as alternative_router
from app.routers.document_router import router as document_router
from app.routers.comment_router import router as comment_router
from app.routers.meeting_note_router import router as meeting_note_router
from app.routers.notification_router import router as notification_router
from app.routers.access_log_router import router as access_log_router
from app.routers.approval_router import router as approval_router
from app.routers.audit_log_router import router as audit_log_router
from app.routers.report_router import router as report_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.decision_version_router import router as decision_version_router

app = FastAPI(title="Expert Decision Replay Platform")

# CORS middleware
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AVATAR_DIR = Path(__file__).resolve().parent.parent / "uploads" / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")

Base.metadata.create_all(bind=engine)

DEFAULT_CATEGORIES = ["Finance", "HR", "IT", "Operations", "Marketing", "Legal", "General"]

DEFAULT_ROLES = [
    ("Admin", "Full platform access"),
    ("Approver", "Can review and approve or reject decisions"),
    ("Decision Reviewer", "Can evaluate decisions and leave feedback"),
    ("Team Member", "Can create decisions and propose alternatives"),
    ("User", "General access to view decisions and platform activity"),
]

db = SessionLocal()
try:
    if db.query(Category).count() == 0:
        db.add_all([Category(name=name) for name in DEFAULT_CATEGORIES])
        db.commit()

    if db.query(Role).count() == 0:
        db.add_all([Role(name=name, description=description) for name, description in DEFAULT_ROLES])
        db.commit()
finally:
    db.close()

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(decision_router)
app.include_router(role_router)
app.include_router(category_router)
app.include_router(alternative_router)
app.include_router(document_router)
app.include_router(comment_router)
app.include_router(meeting_note_router)
app.include_router(notification_router)
app.include_router(access_log_router)
app.include_router(approval_router)
app.include_router(audit_log_router)
app.include_router(report_router)
app.include_router(dashboard_router)
app.include_router(decision_version_router)


@app.get("/")
def home():
    return {"message": "Expert Decision Replay Platform Backend is Running"}