"""One-off dev script: seeds sample notifications for existing users, tailored to
their role, so the Notifications page has realistic content to showcase.

Run with: venv/Scripts/python.exe seed_notifications.py
"""
from datetime import datetime, timedelta, timezone

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.notification import Notification

now = datetime.now(timezone.utc)


def ago(**kwargs):
    return now - timedelta(**kwargs)


NOTIFICATIONS_BY_ROLE = {
    "Admin": [
        dict(category="system", title="New user registered",
             message="Baby Sridevi joined as Decision Reviewer.",
             is_read=False, created_at=ago(minutes=10)),
        dict(category="decisions", title="New decision created",
             message='"Migrate MySQL to PostgreSQL" was created and is in Draft.',
             decision_id=1, is_read=False, created_at=ago(hours=2)),
        dict(category="system", title="Role permissions updated",
             message="The Approver role can now view rejected decisions.",
             is_read=True, created_at=ago(days=1)),
    ],
    "Approver": [
        dict(category="reviews", title="Decision awaiting your approval",
             message='"Self Approval Test" passed level 1 review and is awaiting final approval.',
             decision_id=9, is_read=False, created_at=ago(minutes=30)),
        dict(category="reviews", title="Decision approved",
             message='You approved "Playwright Approval Flow Decision A".',
             decision_id=10, is_read=True, created_at=ago(days=1)),
        dict(category="system", title="Welcome to EDRP",
             message="Your Approver account is ready. You'll be notified whenever a decision needs final sign-off.",
             is_read=True, created_at=ago(days=3)),
    ],
    "Decision Reviewer": [
        dict(category="reviews", title="Decision submitted for review",
             message='"Reviewer Self Decision" was submitted and is awaiting your review.',
             decision_id=12, is_read=False, created_at=ago(minutes=15)),
        dict(category="reviews", title="Decision rejected",
             message='"Playwright Approval Flow Decision B (reject path)" was rejected at level 1.',
             decision_id=11, is_read=True, created_at=ago(days=2)),
        dict(category="system", title="Welcome to EDRP",
             message="Your Decision Reviewer account is ready. Decisions pending your review will show up here.",
             is_read=True, created_at=ago(days=3)),
    ],
    "Team Member": [
        dict(category="decisions", title="Decision status updated",
             message='"Adopt feature flags" status changed to Approved.',
             decision_id=2, is_read=False, created_at=ago(minutes=20)),
        dict(category="decisions", title="New comment on your decision",
             message='A reviewer commented on "Migrate MySQL to PostgreSQL".',
             decision_id=1, is_read=False, created_at=ago(hours=1)),
        dict(category="decisions", title="New document uploaded",
             message='A teammate uploaded "requirements.pdf" to your decision.',
             decision_id=1, is_read=True, created_at=ago(days=2)),
    ],
    "Employee": [
        dict(category="system", title="Welcome to EDRP",
             message="Your account is set up. Explore decisions from the dashboard.",
             is_read=True, created_at=ago(days=4)),
        dict(category="decisions", title="Decision status updated",
             message='"Migrate MySQL to PostgreSQL" status changed to Draft.',
             decision_id=1, is_read=False, created_at=ago(hours=5)),
    ],
}


def main():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        created_count = 0
        for user in users:
            templates = NOTIFICATIONS_BY_ROLE.get(user.role, NOTIFICATIONS_BY_ROLE["Employee"])
            for template in templates:
                db.add(Notification(user_id=user.id, **template))
                created_count += 1
        db.commit()
        print(f"Seeded {created_count} notifications across {len(users)} users.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
