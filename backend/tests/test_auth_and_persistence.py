import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.storage import DatabaseStore


def test_authentication_and_decision_persistence(tmp_path):
    db_path = tmp_path / "decisions.db"
    store = DatabaseStore(str(db_path))

    assert store.authenticate("admin", "admin123")
    assert not store.authenticate("admin", "wrong-password")

    decision = store.create_decision(
        title="Expand analytics suite",
        problem="Improve executive visibility",
        alternatives=["Build in-house", "Buy SaaS"],
        criteria=["Cost", "Time", "Security"],
        risks=["Vendor lock-in"],
        stakeholders=["CIO", "Finance"],
        outcome="Pilot approved",
        status="Approved",
    )

    assert store.get_decision(decision["id"])["title"] == "Expand analytics suite"
    assert len(store.list_decisions()) == 1
