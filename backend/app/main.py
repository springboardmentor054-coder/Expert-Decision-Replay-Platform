from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.connection import Base, engine

# Models
from app.models.user import User
from app.models.role import Role
from app.models.decision import Decision
from app.models.alternative import Alternative
from app.models.document import Document
from app.models.comment import Comment
from app.models.meeting_note import MeetingNote
from app.models.decision_version import DecisionVersion

# Routers
from app.routers.comment import router as comment_router
from app.routers.alternative import router as alternative_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.decisions import router as decisions_router
from app.routers.document import router as document_router
from app.routers.meeting_note import router as meeting_note_router
from app.routers.decision_version import router as decision_version_router


app = FastAPI()


# Serve uploaded files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Include Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(decisions_router)
app.include_router(alternative_router)
app.include_router(document_router)
app.include_router(comment_router)
app.include_router(meeting_note_router)
app.include_router(decision_version_router)


@app.get("/")
def root():
    return {
        "message": "Hello, FastAPI!"
    }