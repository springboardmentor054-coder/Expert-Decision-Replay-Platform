"""One-off migration: adds ON DELETE CASCADE to decision_id foreign keys that
were missing it (decision_versions, alternatives, comments, documents,
meeting_notes), so deleting a decision no longer 500s when it has related
records. Base.metadata.create_all does not alter existing constraints, so
this has to be done directly.

Run with: venv/Scripts/python.exe migrate_decision_cascade.py
"""
from sqlalchemy import text

from app.database.connection import engine

TABLES = ["decision_versions", "alternatives", "comments", "documents", "meeting_notes"]


def main():
    with engine.begin() as conn:
        for table in TABLES:
            constraint_name = f"{table}_decision_id_fkey"
            conn.execute(text(f'ALTER TABLE {table} DROP CONSTRAINT "{constraint_name}"'))
            conn.execute(
                text(
                    f'ALTER TABLE {table} '
                    f'ADD CONSTRAINT "{constraint_name}" '
                    f'FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE'
                )
            )
            print(f"Updated {constraint_name} -> ON DELETE CASCADE")


if __name__ == "__main__":
    main()
