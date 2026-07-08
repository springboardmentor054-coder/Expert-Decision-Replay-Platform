from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
from app.models import user, decision, role
from app.routers.user_router import router as user_router
from app.routers.decision_router import router as decision_router
from app.routers.auth_router import router as auth_router
from app.routers.role_router import router as role_router

app = FastAPI(title="Expert Decision Replay Platform")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(decision_router)
app.include_router(role_router)


@app.get("/")
def home():
    return {"message": "Expert Decision Replay Platform Backend is Running"}