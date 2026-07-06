import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.storage import DatabaseStore


def test_export_report(tmp_path):
    store = DatabaseStore(str(tmp_path / 'export.db'))
    store.create_decision(
        title='Export report',
        problem='Create downloadable summary',
        alternatives=['PDF', 'CSV'],
        criteria=['Format'],
        risks=['None'],
        stakeholders=['Ops'],
        outcome='CSV selected',
        status='Approved',
    )
    report = store.export_report()
    assert 'Export report' in report
