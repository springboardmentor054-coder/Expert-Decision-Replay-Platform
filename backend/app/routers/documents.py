import os
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.decision import Decision
from app.models.document import Document
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.document import DocumentOut
from app.utils.deps import get_current_user

router = APIRouter(tags=["Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
ALLOWED_TYPES = {".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"}
MAX_SIZE = 20 * 1024 * 1024

@router.post("/api/documents/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    decision_id: int = Form(...),
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Decision).filter(Decision.id == decision_id).first():
        raise HTTPException(status_code=400, detail="Decision does not exist")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' is not allowed")
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    save_name = f"{current_user.id}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, save_name)
    with open(save_path, "wb") as f:
        f.write(contents)
    doc = Document(decision_id=decision_id, file_name=file.filename, file_path=save_path,
                   file_type=ext.lstrip("."), file_size=len(contents), uploaded_by=current_user.id)
    db.add(doc)
    ip = request.client.host if request and request.client else None
    db.add(AuditLog(user_id=current_user.id, decision_id=decision_id, action_type="DOCUMENT_UPLOADED",
                    description=f"Document '{file.filename}' uploaded", ip_address=ip))
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/api/documents", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).order_by(Document.id.desc()).all()

@router.get("/api/documents/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/api/documents/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(doc.file_path, filename=doc.file_name)

@router.delete("/api/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()

@router.get("/api/decisions/{decision_id}/documents", response_model=list[DocumentOut])
def list_decision_documents(decision_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not db.query(Decision).filter(Decision.id == decision_id).first():
        raise HTTPException(status_code=404, detail="Decision not found")
    return db.query(Document).filter(Document.decision_id == decision_id).order_by(Document.id.desc()).all()
