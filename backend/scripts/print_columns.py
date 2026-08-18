import os
from sqlalchemy import create_engine, inspect

url = os.environ.get('DATABASE_URL')
if not url:
    print('Set DATABASE_URL env var')
    raise SystemExit(1)
engine = create_engine(url)
inspector = inspect(engine)
if not inspector.has_table('decisions'):
    print("Table 'decisions' does not exist")
else:
    cols = inspector.get_columns('decisions')
    print('Columns for decisions:')
    for c in cols:
        print('-', c['name'], c.get('type'))
