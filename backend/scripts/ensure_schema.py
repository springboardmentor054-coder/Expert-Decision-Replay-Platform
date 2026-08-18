"""
Ensure key columns exist in the database schema and add them if missing.
Run with the `DATABASE_URL` environment variable set.
Example (PowerShell):
  $env:DATABASE_URL='postgresql://user:pw@host:5432/dbname'
  python backend/scripts/ensure_schema.py

This script inspects the `decisions` table and adds `problem_statement` if absent.
"""
import os
import sys
from sqlalchemy import create_engine, text, inspect


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("ERROR: DATABASE_URL environment variable is not set.")
        sys.exit(1)

    engine = create_engine(url)
    inspector = inspect(engine)

    table = "decisions"
    if not inspector.has_table(table):
        print(f"Table '{table}' does not exist in the database.")
        print("If this is a fresh DB, starting the app will create tables automatically.")
        sys.exit(1)

    cols = [c["name"] for c in inspector.get_columns(table)]

    actions = []
    if "problem_statement" not in cols:
        actions.append(("problem_statement", "TEXT"))

    if not actions:
        print("No missing columns detected for table 'decisions'. Nothing to do.")
        return

    with engine.begin() as conn:
        for col_name, col_type in actions:
            print(f"Adding column '{col_name}' ({col_type}) to '{table}'...")
            # Use dialect-agnostic ALTER TABLE syntax; most DBs support this simple form
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
        print("Schema update completed.")


if __name__ == "__main__":
    main()
