from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.routers import users, decisions, alternatives, comments, documents, approvals, analytics, audit, reports, notifications
from backend.app import models, auth

from sqlalchemy import inspect, text

# Migrate database tables if needed
def update_db_schema():
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        with engine.connect() as conn:
            # 1. Decisions table
            if "decisions" in tables:
                cols = [c["name"] for c in inspector.get_columns("decisions")]
                if "description" not in cols:
                    conn.execute(text("ALTER TABLE decisions ADD COLUMN description TEXT"))
                if "category_id" not in cols:
                    conn.execute(text("ALTER TABLE decisions ADD COLUMN category_id VARCHAR"))
                if "meeting_summary" not in cols:
                    conn.execute(text("ALTER TABLE decisions ADD COLUMN meeting_summary TEXT"))
                if "conclusion" not in cols:
                    conn.execute(text("ALTER TABLE decisions ADD COLUMN conclusion TEXT"))
                if "next_action" not in cols:
                    conn.execute(text("ALTER TABLE decisions ADD COLUMN next_action TEXT"))

            # 2. Audit logs table
            if "audit_logs" in tables:
                cols = [c["name"] for c in inspector.get_columns("audit_logs")]
                if "decision_id" not in cols:
                    conn.execute(text("ALTER TABLE audit_logs ADD COLUMN decision_id INTEGER"))
                if "action_type" not in cols:
                    if "action" in cols:
                        try:
                            conn.execute(text("ALTER TABLE audit_logs RENAME COLUMN action TO action_type"))
                        except Exception:
                            conn.execute(text("ALTER TABLE audit_logs ADD COLUMN action_type VARCHAR"))
                    else:
                        conn.execute(text("ALTER TABLE audit_logs ADD COLUMN action_type VARCHAR"))
                if "description" not in cols:
                    if "details" in cols:
                        try:
                            conn.execute(text("ALTER TABLE audit_logs RENAME COLUMN details TO description"))
                        except Exception:
                            conn.execute(text("ALTER TABLE audit_logs ADD COLUMN description TEXT"))
                    else:
                        conn.execute(text("ALTER TABLE audit_logs ADD COLUMN description TEXT"))

            # 3. Users table
            if "users" in tables:
                cols = [c["name"] for c in inspector.get_columns("users")]
                if "team" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN team VARCHAR"))

            conn.commit()
    except Exception as e:
        print(f"Error migrating schema: {e}")

update_db_schema()

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database with initial users if database is empty
def seed_users():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            print("Seeding database with default accounts...")
            
            # Default Administrator
            admin_user = models.User(
                email="admin@company.com",
                hashed_password=auth.get_password_hash("AdminPassword123"),
                full_name="System Administrator",
                role=models.UserRole.ADMINISTRATOR.value,
                team="IT Operations"
            )
            db.add(admin_user)
            
            # Default Manager
            manager_user = models.User(
                email="manager@company.com",
                hashed_password=auth.get_password_hash("ManagerPassword123"),
                full_name="Jane Doe (Manager)",
                role=models.UserRole.MANAGER.value,
                team="Engineering Management"
            )
            db.add(manager_user)
            
            # Default Reviewer
            reviewer_user = models.User(
                email="reviewer@company.com",
                hashed_password=auth.get_password_hash("ReviewerPassword123"),
                full_name="Alex Smith (Reviewer)",
                role=models.UserRole.REVIEWER.value,
                team="Technical Architecture"
            )
            db.add(reviewer_user)
            
            # Default Employee
            employee_user = models.User(
                email="employee@company.com",
                hashed_password=auth.get_password_hash("EmployeePassword123"),
                full_name="John Doe (Employee)",
                role=models.UserRole.EMPLOYEE.value,
                team="Frontend Team"
            )
            db.add(employee_user)
            
            db.commit()
            print("Seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

seed_users()

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Centralized platform for recording and governance of organizational decisions.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory to serve files statically
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(decisions.router, prefix=settings.API_V1_STR)
app.include_router(alternatives.router, prefix=settings.API_V1_STR)
app.include_router(comments.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(approvals.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(audit.extra_router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")
