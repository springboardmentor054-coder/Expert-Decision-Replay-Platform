import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Routers
from app.routers import auth
from app.routers import users
from app.routers import roles
from app.routers import decision
from app.routers import alternatives
from app.routers import documents
from app.routers import comments
from app.routers import discussion
from app.routers import decision_versions
from app.routers import approval
from app.routers import notification
from app.routers import audit_log
from app.routers import dashboard
from app.routers import reports

# Models
from app.models import user, role
import app.models.decision
import app.models.alternative
import app.models.document
import app.models.comment
import app.models.decision_version
from app.models.notification import Notification
import app.models.audit_log

# Database
from app.database.connection import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Serve uploaded documents
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# Allow React frontend to connect
# Uses FRONTEND_URL in production.
# Falls back to localhost for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(decision.router)
app.include_router(alternatives.router)
app.include_router(documents.router)
app.include_router(comments.router)
app.include_router(discussion.router)
app.include_router(decision_versions.router)
app.include_router(approval.router)
app.include_router(notification.router)
app.include_router(audit_log.router)
app.include_router(dashboard.router)
app.include_router(reports.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Expert Decision Replay Platform"
    }
