import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.storage import DatabaseStore


def test_version_history_and_audit_logs(tmp_path):
    store = DatabaseStore(str(tmp_path / 'audit.db'))
    decision = store.create_decision(
        title='Policy update',
        problem='Align policy',
        alternatives=['Keep', 'Update'],
        criteria=['Compliance'],
        risks=['Adoption'],
        stakeholders=['HR'],
        outcome='Draft',
        status='Draft',
    )
    store.record_version(decision['id'], 'Initial draft')
    store.record_audit(decision['id'], 'created')
    updated = store.get_decision(decision['id'])
    assert len(updated['history']) == 1
    assert len(updated['audit']) == 1
    assert updated['audit'][0]['event'] == 'created'
