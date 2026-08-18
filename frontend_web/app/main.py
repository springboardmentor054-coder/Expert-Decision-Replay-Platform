from flask import Flask, render_template, redirect, url_for, request
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "flask_secret_session_key_for_decision_replay_1298")

# Configure backend API URL (for client-side reference)
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000/api/v1")

@app.context_processor
def inject_config():
    return {"BACKEND_API_URL": BACKEND_API_URL}

@app.route("/")
def index():
    # Frontend handles redirection in JS based on auth token
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/decisions/create")
def create_decision():
    return render_template("create_decision.html")

@app.route("/decisions/<int:decision_id>")
def decision_detail(decision_id):
    return render_template("decision_detail.html", decision_id=decision_id)

@app.route("/decisions/<int:decision_id>/edit")
def edit_decision(decision_id):
    return render_template("edit_decision.html", decision_id=decision_id)

@app.route("/documents")
def documents():
    return render_template("documents.html")

@app.route("/documents/upload")
def upload_document():
    return render_template("upload_document.html")

@app.route("/reports")
def reports():
    return render_template("reports.html")

@app.route("/audit-logs")
def audit_logs():
    return render_template("audit_logs.html")

@app.route("/notifications")
def notifications():
    return render_template("notifications.html")

if __name__ == "__main__":
    app.run(port=5000, debug=True)
