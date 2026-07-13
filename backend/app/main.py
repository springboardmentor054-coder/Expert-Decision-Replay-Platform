from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

from app.models.user import User
from app.models.role import Role
from app.models.decision import Decision
from app.models.alternative import Alternative

from app.routers.alternative import router as alternative_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.decisions import router as decisions_router


app = FastAPI()


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



@app.get("/")
def root():
    return {
        "message": "Hello, FastAPI!"
    }