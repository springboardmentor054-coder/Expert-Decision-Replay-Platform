"""
Document Management module (matches mentor spec exactly):

Required APIs:
- POST   /documents/upload          (decision_id + file, validated)
- GET    /documents                 (list all documents)
- GET    /documents/{id}            (single document metadata)
- DELETE /documents/{id}            (delete)
- GET    /decisions/{id}/documents  (documents for one decision)

Plus a download helper: GET /documents/{id}/download

Validation (Task 5):
- A file cannot be uploaded without selecting a decision (decision_id required + must exist)
- Only PDF, DOCX, XLSX, PNG, JPG allowed
- File size restricted (MAX_UPLOAD_MB, configurable in .env)
- Proper error messages returned on any failure
"""
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Document, Decision, User, AuditActionType
from app.schemas import DocumentOut
from app.deps import get_current_user
from app.routers.audit import create_audit_log
from app.routers.notifications import notify_stakeholders

router = APIRouter(tags=["Document Management"])

MAX_UPLOAD_BYTES = settings.MAX_UPLOAD_MB * 1024 * 1024

# Task 5: only these document types are allowed
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        # .xlsx
    "image/png",
    "image/jpeg",
}


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found. A file cannot be uploaded without a valid decision.")
    return decision


def _validate_file_type(filename: str, content_type: Optional[str]):
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: PDF, DOCX, XLSX, PNG, JPG.",
        )
    # content_type check is best-effort (browsers/clients don't always set it correctly),
    # so we only hard-fail on extension, but flag a clearly wrong content_type too.
    if content_type and content_type not in ALLOWED_CONTENT_TYPES and ext not in {".jpg", ".jpeg"}:
        if content_type not in ("application/octet-stream",):
            raise HTTPException(
                status_code=400,
                detail=f"File content type '{content_type}' does not match an allowed document type.",
            )


async def _save_upload(decision_id: int, file: UploadFile, db: Session, current_user: User) -> Document:
    _get_decision_or_404(db, decision_id)
    _validate_file_type(file.filename, file.content_type)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413, detail=f"File exceeds max upload size of {settings.MAX_UPLOAD_MB}MB"
        )
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    ext = os.path.splitext(file.filename or "")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    stored_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    try:
        with open(stored_path, "wb") as f:
            f.write(contents)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    document = Document(
        decision_id=decision_id,
        file_name=file.filename or stored_name,
        file_path=stored_path,
        file_type=file.content_type,
        file_size=len(contents),
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    create_audit_log(
        db=db,
        user_id=current_user.id,
        decision_id=decision_id,
        action_type=AuditActionType.UPLOAD_DOCUMENT,
        description=f"Uploaded document '{document.file_name}' for decision ID {decision_id}",
    )
    notify_stakeholders(
        db,
        decision_id=decision_id,
        title=f"Document uploaded for {decision.title}",
        message=f"{current_user.full_name} uploaded '{document.file_name}'",
        exclude_user_id=current_user.id,
    )
    return document


# ---------------------------------------------------------------------------
# Required endpoints (exact spec)
# ---------------------------------------------------------------------------

@router.post("/documents/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    decision_id: int = Form(..., description="ID of the decision this file belongs to"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a document. decision_id is required (a file cannot be uploaded
    without selecting a decision)."""
    return await _save_upload(decision_id, file, db, current_user)


@router.get("/documents", response_model=List[DocumentOut])
def list_all_documents(
    decision_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents across the platform, optionally filtered by decision_id."""
    query = db.query(Document)
    if decision_id is not None:
        query = query.filter(Document.decision_id == decision_id)
    return query.order_by(Document.uploaded_at.desc()).all()


@router.get("/documents/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.uploaded_by != current_user.id and current_user.role.value not in ("manager", "administrator"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()
    return None


@router.get("/decisions/{decision_id}/documents", response_model=List[DocumentOut])
def list_documents_for_decision(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _get_decision_or_404(db, decision_id)
    return db.query(Document).filter(Document.decision_id == decision_id).order_by(Document.uploaded_at.desc()).all()


# ---------------------------------------------------------------------------
# Convenience: actual file download (not in the required list, but needed to
# make the "Download/View button" in the frontend spec functional)
# ---------------------------------------------------------------------------

@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=410, detail="File is missing from storage")
    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.file_type or "application/octet-stream",
    )
