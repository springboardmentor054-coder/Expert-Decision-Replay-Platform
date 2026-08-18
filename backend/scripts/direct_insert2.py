import os
from sqlalchemy import create_engine, text

url = os.environ.get('DATABASE_URL')
if not url:
    print('set DATABASE_URL')
    raise SystemExit(1)
eng = create_engine(url)
with eng.begin() as conn:
    r = conn.execute(text("INSERT INTO decisions (title, problem_statement, description, category, status, created_by) VALUES ('Direct Insert 2','PS','d','Strategy','open',6) RETURNING id"))
    print('insert id:', r.fetchone()[0])
