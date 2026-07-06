import json
import sqlite3
from pathlib import Path
from uuid import uuid4


class DatabaseStore:
    def __init__(self, db_path: str = "backend/app/decisions.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._connect()
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS decisions (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    problem TEXT,
                    alternatives TEXT,
                    criteria TEXT,
                    risks TEXT,
                    stakeholders TEXT,
                    outcome TEXT,
                    status TEXT,
                    discussion TEXT,
                    approvals TEXT,
                    history TEXT,
                    audit TEXT,
                    approved INTEGER DEFAULT 0
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    def authenticate(self, username: str, password: str) -> bool:
        return username == "admin" and password == "admin123"

    def create_decision(self, title, problem, alternatives, criteria, risks, stakeholders, outcome, status="Draft"):
        decision_id = str(uuid4())
        connection = self._connect()
        try:
            connection.execute(
                """
                INSERT INTO decisions (id, title, problem, alternatives, criteria, risks, stakeholders, outcome, status, discussion, approvals, history, audit, approved)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    decision_id,
                    title,
                    problem,
                    json.dumps(alternatives),
                    json.dumps(criteria),
                    json.dumps(risks),
                    json.dumps(stakeholders),
                    outcome,
                    status,
                    json.dumps([]),
                    json.dumps([]),
                    json.dumps([]),
                    json.dumps([]),
                    1 if status == "Approved" else 0,
                ),
            )
            connection.commit()
        finally:
            connection.close()
        return self.get_decision(decision_id)

    def list_decisions(self):
        connection = self._connect()
        try:
            rows = connection.execute(
                "SELECT id, title, problem, alternatives, criteria, risks, stakeholders, outcome, status, discussion, approvals, history, audit, approved FROM decisions ORDER BY title"
            ).fetchall()
        finally:
            connection.close()
        return [
            {
                "id": row[0],
                "title": row[1],
                "problem": row[2],
                "alternatives": json.loads(row[3]) if row[3] else [],
                "criteria": json.loads(row[4]) if row[4] else [],
                "risks": json.loads(row[5]) if row[5] else [],
                "stakeholders": json.loads(row[6]) if row[6] else [],
                "outcome": row[7],
                "status": row[8],
                "discussion": json.loads(row[9]) if row[9] else [],
                "approvals": json.loads(row[10]) if row[10] else [],
                "history": json.loads(row[11]) if row[11] else [],
                "audit": json.loads(row[12]) if row[12] else [],
                "approved": bool(row[13]),
            }
            for row in rows
        ]

    def get_decision(self, decision_id):
        connection = self._connect()
        try:
            row = connection.execute(
                "SELECT id, title, problem, alternatives, criteria, risks, stakeholders, outcome, status, discussion, approvals, history, audit, approved FROM decisions WHERE id = ?",
                (decision_id,),
            ).fetchone()
        finally:
            connection.close()
        if not row:
            return None
        return {
            "id": row[0],
            "title": row[1],
            "problem": row[2],
            "alternatives": json.loads(row[3]) if row[3] else [],
            "criteria": json.loads(row[4]) if row[4] else [],
            "risks": json.loads(row[5]) if row[5] else [],
            "stakeholders": json.loads(row[6]) if row[6] else [],
            "outcome": row[7],
            "status": row[8],
            "discussion": json.loads(row[9]) if row[9] else [],
            "approvals": json.loads(row[10]) if row[10] else [],
            "history": json.loads(row[11]) if row[11] else [],
            "audit": json.loads(row[12]) if row[12] else [],
            "approved": bool(row[13]),
        }

    def add_comment(self, decision_id, comment):
        decision = self.get_decision(decision_id)
        if not decision:
            return None
        discussion = decision.get("discussion", []) + [{"text": comment}]
        connection = self._connect()
        try:
            connection.execute(
                "UPDATE decisions SET discussion = ? WHERE id = ?",
                (json.dumps(discussion), decision_id),
            )
            connection.commit()
        finally:
            connection.close()
        return self.get_decision(decision_id)

    def add_approval(self, decision_id, approver):
        decision = self.get_decision(decision_id)
        if not decision:
            return None
        approvals = decision.get("approvals", []) + [{"approver": approver, "status": "Approved"}]
        connection = self._connect()
        try:
            connection.execute(
                "UPDATE decisions SET approvals = ?, approved = ? WHERE id = ?",
                (json.dumps(approvals), 1 if approvals else 0, decision_id),
            )
            connection.commit()
        finally:
            connection.close()
        return self.get_decision(decision_id)

    def record_version(self, decision_id, note):
        decision = self.get_decision(decision_id)
        if not decision:
            return None
        history = decision.get("history", []) + [{"note": note}]
        connection = self._connect()
        try:
            connection.execute("UPDATE decisions SET history = ? WHERE id = ?", (json.dumps(history), decision_id))
            connection.commit()
        finally:
            connection.close()
        return self.get_decision(decision_id)

    def record_audit(self, decision_id, event):
        decision = self.get_decision(decision_id)
        if not decision:
            return None
        audit = decision.get("audit", []) + [{"event": event}]
        connection = self._connect()
        try:
            connection.execute("UPDATE decisions SET audit = ? WHERE id = ?", (json.dumps(audit), decision_id))
            connection.commit()
        finally:
            connection.close()
        return self.get_decision(decision_id)

    def export_report(self):
        decisions = self.list_decisions()
        lines = ["Decision Report", "================", ""]
        for decision in decisions:
            lines.append(f"- {decision['title']} | Status: {decision['status']} | Approved: {'Yes' if decision.get('approved') else 'No'}")
            lines.append(f"  Problem: {decision.get('problem', '')}")
            lines.append(f"  Outcome: {decision.get('outcome', '')}")
            lines.append("")
        return "\n".join(lines)
