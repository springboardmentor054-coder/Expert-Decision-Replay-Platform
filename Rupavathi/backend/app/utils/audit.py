from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def _client_ip(request: "Request | None") -> str | None:
    if request is None or request.client is None:
        return None
    return request.client.host


def create_audit_log(
    db: Session,
    user_id: int,
    action_type: str,
    description: str,
    decision_id: int | None = None,
    request: "Request | None" = None,
) -> None:
    db.add(
        AuditLog(
            user_id=user_id,
            decision_id=decision_id,
            action_type=action_type,
            description=description,
            ip_address=_client_ip(request),
        )
    )
    db.commit()
