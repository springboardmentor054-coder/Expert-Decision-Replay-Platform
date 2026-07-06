from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import sys
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.storage import DatabaseStore


store = DatabaseStore()


class DecisionStore(DatabaseStore):
    def __init__(self, db_path: str = "backend/app/decisions.db"):
        super().__init__(db_path)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json(200, {"status": "ok", "service": "ExpertDecisionReplayPlatform backend"})
            return
        if parsed.path == "/api/decisions":
            self._send_json(200, {"decisions": store.list_decisions()})
            return
        if parsed.path == "/api/reports":
            decisions = store.list_decisions()
            self._send_json(200, {
                "summary": {
                    "total": len(decisions),
                    "approved": sum(1 for d in decisions if d.get("approved")),
                    "in_progress": sum(1 for d in decisions if d.get("status") == "In Progress")
                },
                "decisions": decisions,
            })
            return
        if parsed.path == "/api/export":
            report = store.export_report()
            body = report.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Disposition", "attachment; filename=decision_report.txt")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path.startswith("/api/decisions/"):
            decision_id = parsed.path.split("/")[-1]
            decision = store.get_decision(decision_id)
            if decision:
                self._send_json(200, {"decision": decision})
            else:
                self._send_json(404, {"error": "Decision not found"})
            return
        self._send_json(200, {"message": "ExpertDecisionReplayPlatform backend is running."})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/login":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            authenticated = store.authenticate(data.get("username", ""), data.get("password", ""))
            if authenticated:
                self._send_json(200, {"success": True, "message": "Logged in"})
            else:
                self._send_json(401, {"success": False, "message": "Invalid credentials"})
            return
        if parsed.path == "/api/comments":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            decision = store.add_comment(data.get("decision_id"), data.get("comment", ""))
            self._send_json(201, {"decision": decision})
            return
        if parsed.path == "/api/approvals":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            decision = store.add_approval(data.get("decision_id"), data.get("approver", "Unknown"))
            self._send_json(201, {"decision": decision})
            return
        if parsed.path == "/api/audit":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            decision = store.record_audit(data.get("decision_id"), data.get("event", "updated"))
            self._send_json(201, {"decision": decision})
            return
        if parsed.path == "/api/versions":
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            decision = store.record_version(data.get("decision_id"), data.get("note", "Updated"))
            self._send_json(201, {"decision": decision})
            return
        if parsed.path != "/api/decisions":
            self._send_json(404, {"error": "Not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(length).decode("utf-8"))
        decision = store.create_decision(
            title=data.get("title", "Untitled decision"),
            problem=data.get("problem", ""),
            alternatives=data.get("alternatives", []),
            criteria=data.get("criteria", []),
            risks=data.get("risks", []),
            stakeholders=data.get("stakeholders", []),
            outcome=data.get("outcome", ""),
            status=data.get("status", "Draft")
        )
        self._send_json(201, {"decision": decision})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 8000), Handler)
    print("Backend listening on http://127.0.0.1:8000")
    server.serve_forever()

