from app.database.connection import engine, Base

# Import all models
from app.models.user import User
from app.models.role import Role

# Create all tables
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")