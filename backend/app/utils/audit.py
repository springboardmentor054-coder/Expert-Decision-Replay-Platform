from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user_id: int,
    action_type: str,
    description: str,
    decision_id: int | None = None,
    ip_address: str | None = None
):

    audit_log = AuditLog(
        user_id=user_id,
        decision_id=decision_id,
        action_type=action_type,
        description=description,
        ip_address=ip_address
    )

    db.add(audit_log)

    return audit_log