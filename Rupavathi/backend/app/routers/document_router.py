import mimetypes
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.decision import Decision
from app.models.document import Document
from app.models.user import User
from app.schemas.document_schema import DocumentResponse
from app.utils.dependencies import get_current_user
from app.utils.notifications import create_notification
from app.utils.audit import create_audit_log

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


def _get_document_or_404(db: Session, document_id: int) -> Document:
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


# Upload Document
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    decision_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decision = _get_decision_or_404(db, decision_id)

    original_name = file.filename or ""
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Allowed types: PDF, DOCX, XLSX, PNG, JPG.",
        )

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File is too large. Maximum allowed size is {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{extension}"
    stored_path = UPLOAD_DIR / stored_name

    with open(stored_path, "wb") as out_file:
        out_file.write(contents)

    new_document = Document(
        decision_id=decision_id,
        file_name=original_name,
        file_path=str(stored_path),
        file_type=extension.lstrip("."),
        file_size=len(contents),
        uploaded_by=current_user.id,
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    create_audit_log(
        db,
        user_id=current_user.id,
        action_type="Document Uploaded",
        description=f'Uploaded "{original_name}" to "{decision.title}"',
        decision_id=decision.id,
        request=request,
    )

    if decision.created_by != current_user.id:
        create_notification(
            db,
            user_id=decision.created_by,
            category="decisions",
            title="New document uploaded",
            message=f'{current_user.full_name} uploaded "{original_name}" to "{decision.title}"',
            decision_id=decision.id,
        )

    return new_document


# Get All Documents
@router.get("/", response_model=list[DocumentResponse])
def get_all_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()


# Get Document By ID
@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    return _get_document_or_404(db, document_id)


# Download / View Document
@router.get("/{document_id}/download")
def download_document(document_id: int, db: Session = Depends(get_db)):
    document = _get_document_or_404(db, document_id)

    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File is missing on the server")

    media_type = mimetypes.guess_type(document.file_name)[0] or "application/octet-stream"

    return FileResponse(path=file_path, media_type=media_type, filename=document.file_name)


# Delete Document
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _get_document_or_404(db, document_id)

    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}
