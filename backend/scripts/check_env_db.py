import os
from sqlalchemy import create_engine, text
print('env DATABASE_URL=', os.environ.get('DATABASE_URL'))
eng = create_engine(os.environ.get('DATABASE_URL'))
print('engine.url=', eng.url)
with eng.begin() as conn:
    r = conn.execute(text("SELECT current_database() as db, current_schema() as schema, current_schemas(true) as schemas"))
    print('db info:', r.fetchone())
