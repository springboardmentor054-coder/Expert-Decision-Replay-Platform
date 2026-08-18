"""Seed default roles. Run once: python seed_roles.py"""
from dotenv import load_dotenv
load_dotenv()
from app.database.session import Base, SessionLocal, engine
from app import models  # noqa
from app.models.role import Role

DEFAULT_ROLES = [
    ("Admin", "Full platform access including audit logs and reports"),
    ("Approver", "Can review and approve or reject decisions"),
    ("Contributor", "Can create decisions and propose alternatives"),
    ("Viewer", "Read-only access to decisions"),
]

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for name, description in DEFAULT_ROLES:
            if not db.query(Role).filter(Role.name == name).first():
                db.add(Role(name=name, description=description))
                print(f"Created role: {name}")
            else:
                print(f"Role exists: {name}")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
