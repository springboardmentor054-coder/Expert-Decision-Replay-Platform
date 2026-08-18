import os
from sqlalchemy import create_engine, text

url = os.environ.get('DATABASE_URL')
if not url:
    print('Set DATABASE_URL')
    raise SystemExit(1)
engine = create_engine(url)
with engine.connect() as conn:
    rows = conn.execute(text("SELECT n.nspname AS schema, c.relname AS table FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname='decisions' ORDER BY n.nspname")).fetchall()
    if not rows:
        print('no tables named decisions')
    else:
        for r in rows:
            print(r.schema, r.table)

    # list temp schemas
    tmp = conn.execute(text("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'pg_temp_%' ORDER BY nspname")).fetchall()
    print('temp schemas:', [t[0] for t in tmp])
