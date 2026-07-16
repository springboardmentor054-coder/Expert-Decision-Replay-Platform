from fastapi import FastAPI

from app.routers import auth
from app.routers import users
from app.routers import roles
from app.routers import decision
from app.routers import alternative
from app.routers import file_upload
from app.routers import discussion
from app.routers import decision_version

from app.database.database import engine
from app.database import base

base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expert Decision Replay Platform API"
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(decision.router)
app.include_router(alternative.router)
app.include_router(file_upload.router)
app.include_router(discussion.router)
app.include_router(decision_version.router)


@app.get("/")
def home():
    return {
        "message": "Backend is running successfully!"
    }