import os
from sqlalchemy import create_engine, text

url = os.environ.get('DATABASE_URL')
if not url:
    print('Set DATABASE_URL env var')
    raise SystemExit(1)
engine = create_engine(url)
with engine.connect() as conn:
    res = conn.execute(text("SELECT table_schema, column_name FROM information_schema.columns WHERE table_name='decisions' ORDER BY table_schema, column_name"))
    rows = res.fetchall()
    if not rows:
        print('No decisions table found in any schema')
    else:
        for r in rows:
            print(r[0], r[1])
