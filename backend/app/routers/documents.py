import os
import shutil

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.document import Document
from app.models.decision import Decision
from app.schemas.document import DocumentResponse

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Allowed file types
ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",   # DOCX
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",         # XLSX
    "image/png",
    "image/jpeg"
]

# Maximum file size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


# -------------------------
# Upload Document
# -------------------------
@router.post("/upload")
def upload_document(
    decision_id: int = Form(...),
    uploaded_by: int = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check whether decision exists
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    # Validate file type
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, XLSX, PNG and JPG files are allowed."
        )

    # Read file for size validation
    file_content = file.file.read()

    # Validate file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size should not exceed 10 MB."
        )

    # Reset file pointer
    file.file.seek(0)

    # Save file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save details in database
    document = Document(
        decision_id=decision_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=os.path.getsize(file_path),
        uploaded_by=uploaded_by
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document": document
    }


# -------------------------
# Get All Documents
# -------------------------
@router.get("/", response_model=list[DocumentResponse])
def get_all_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).all()
    return documents


# -------------------------
# Get Document By ID
# -------------------------
@router.get("/{id}", response_model=DocumentResponse)
def get_document(id: int, db: Session = Depends(get_db)):

    document = db.query(Document).filter(
        Document.id == id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


# -------------------------
# Delete Document
# -------------------------
@router.delete("/{id}")
def delete_document(id: int, db: Session = Depends(get_db)):

    document = db.query(Document).filter(
        Document.id == id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    # Delete file from uploads folder
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Delete database record
    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }