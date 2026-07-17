"""
Document Management module:
- Upload supporting files/attachments to a decision
- List and download documents
- Simple local filesystem storage (swap for AWS S3 in production — see README)
"""
import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Document, Decision, User
from app.schemas import DocumentOut
from app.deps import get_current_user

router = APIRouter(tags=["Document Management"])

MAX_UPLOAD_BYTES = settings.MAX_UPLOAD_MB * 1024 * 1024


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.post(
    "/decisions/{decision_id}/documents",
    response_model=DocumentOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    decision_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_decision_or_404(db, decision_id)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413, detail=f"File exceeds max upload size of {settings.MAX_UPLOAD_MB}MB"
        )

    ext = os.path.splitext(file.filename or "")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    stored_path = os.path.join(settings.UPLOAD_DIR, stored_name)

    with open(stored_path, "wb") as f:
        f.write(contents)

    document = Document(
        decision_id=decision_id,
        filename=file.filename or stored_name,
        stored_path=stored_path,
        content_type=file.content_type,
        size_bytes=len(contents),
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/decisions/{decision_id}/documents", response_model=List[DocumentOut])
def list_documents(
    decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _get_decision_or_404(db, decision_id)
    return db.query(Document).filter(Document.decision_id == decision_id).order_by(Document.uploaded_at.desc()).all()


@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if not os.path.exists(document.stored_path):
        raise HTTPException(status_code=410, detail="File is missing from storage")
    return FileResponse(
        path=document.stored_path,
        filename=document.filename,
        media_type=document.content_type or "application/octet-stream",
    )


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.uploaded_by != current_user.id and current_user.role.value not in ("manager", "administrator"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")

    if os.path.exists(document.stored_path):
        os.remove(document.stored_path)

    db.delete(document)
    db.commit()
    return None
