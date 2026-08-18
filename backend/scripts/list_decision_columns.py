import os
from sqlalchemy import create_engine, text
eng=create_engine(os.environ.get('DATABASE_URL'))
with eng.begin() as conn:
    r=conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='decisions' ORDER BY ordinal_position"))
    for row in r:
        print(row)
