import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.storage import DatabaseStore


def test_approval_and_discussion_flow(tmp_path):
    store = DatabaseStore(str(tmp_path / 'workflow.db'))
    decision = store.create_decision(
        title='Approve vendor migration',
        problem='Reduce vendor risk',
        alternatives=['Stay', 'Switch'],
        criteria=['Cost', 'Risk'],
        risks=['Delay'],
        stakeholders=['Procurement'],
        outcome='Pending review',
        status='In Progress',
    )
    store.add_comment(decision['id'], 'Initial review note')
    store.add_approval(decision['id'], 'Finance')
    updated = store.get_decision(decision['id'])
    assert len(updated['discussion']) == 1
    assert len(updated['approvals']) == 1
    assert updated['approvals'][0]['approver'] == 'Finance'
