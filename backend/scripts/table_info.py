import os
from sqlalchemy import create_engine, text
eng=create_engine(os.environ.get('DATABASE_URL'))
with eng.begin() as conn:
    r=conn.execute(text("SELECT oid, relname, relkind FROM pg_class WHERE relname='decisions'"))
    print('pg_class row:', r.fetchone())
    r=conn.execute(text("SELECT table_schema,table_name FROM information_schema.tables WHERE table_name='decisions'"))
    print('information_schema.tables rows:', r.fetchall())
