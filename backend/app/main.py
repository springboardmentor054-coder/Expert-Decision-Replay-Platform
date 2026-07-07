from fastapi import FastAPI

from app.database.connection import Base, engine
from app.models.user import User
from app.models.role import Role
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)
app.include_router(users_router)
@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}