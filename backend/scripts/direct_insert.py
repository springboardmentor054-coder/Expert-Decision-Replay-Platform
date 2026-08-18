import os
from sqlalchemy import create_engine, text

url = os.environ.get('DATABASE_URL')
if not url:
    print('set DATABASE_URL')
    raise SystemExit(1)
eng = create_engine(url)
with eng.begin() as conn:
    r = conn.execute(text("INSERT INTO decisions (title, problem_statement, description, category, status, created_by) VALUES ('Direct Insert','PS','d','Strategy','open',1) RETURNING id"))
    row = r.fetchone()
    print('insert id:', row[0])
