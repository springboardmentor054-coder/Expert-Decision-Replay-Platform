"""One-off migration: adds bio, phone, and department columns to the users
table for the expanded Profile page. Base.metadata.create_all does not alter
existing tables, so this has to be done directly.

Run with: venv/Scripts/python.exe migrate_user_profile_fields.py
"""
from sqlalchemy import text

from app.database.connection import engine

COLUMNS = ["bio", "phone", "department"]


def main():
    with engine.begin() as conn:
        for column in COLUMNS:
            conn.execute(text(f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {column} VARCHAR'))
            print(f"Added column: {column}")


if __name__ == "__main__":
    main()
