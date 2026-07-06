import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import DecisionStore


def test_store_and_fetch_decision():
    store = DecisionStore()
    decision = store.create_decision(
        title="Adopt cloud migration",
        problem="Reduce operational cost",
        alternatives=["Rehost", "Refactor"],
        criteria=["Cost", "Risk"],
        risks=["Migration delay"],
        stakeholders=["CTO", "Finance"],
        outcome="Approved for pilot"
    )
    assert decision["title"] == "Adopt cloud migration"
    assert len(store.list_decisions()) == 1
    assert store.get_decision(decision["id"])["title"] == "Adopt cloud migration"
