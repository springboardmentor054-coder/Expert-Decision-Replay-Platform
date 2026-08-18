from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.config import settings

router = APIRouter(prefix="/documents", tags=["Document Management"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

@router.post("/upload", response_model=schemas.DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    decision_id: int = Form(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate Decision presence
    if not decision_id:
        raise HTTPException(status_code=400, detail="A file cannot be uploaded without selecting a decision.")
    
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail=f"Decision with ID {decision_id} does not exist.")

    # 2. Validate File Extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type '{file_ext}'. Allowed document types: PDF, DOCX, XLSX, PNG, JPG."
        )

    # 3. Read & Validate File Size
    try:
        contents = file.file.read()
        file_size = len(contents)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400, 
                detail=f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum allowed limit of 10 MB."
            )
        file.file.seek(0)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

    # 4. Generate unique filename and save file in uploads folder
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(dest_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file on server: {str(e)}")

    # 5. Save Document Record in Database
    doc = models.Document(
        decision_id=decision_id,
        file_name=file.filename,
        file_path=unique_filename,
        file_type=file_ext.lstrip('.').upper(),
        file_size=file_size,
        uploaded_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    auth.log_activity(
        db, current_user.id, "UPLOAD_DOCUMENT", 
        f"Uploaded document '{doc.file_name}' ({doc.file_size} bytes) for decision {decision_id}.",
        decision_id=decision_id
    )
    return doc

@router.get("/", response_model=List[schemas.DocumentResponse])
def get_documents(
    decision_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Document)
    if decision_id is not None:
        query = query.filter(models.Document.decision_id == decision_id)
    return query.order_by(models.Document.uploaded_at.desc()).all()

@router.get("/{document_id}", response_model=schemas.DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Check permission: uploader, decision creator, or manager/admin
    if doc.uploaded_by != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document.")

    # Remove file from uploads folder if it exists
    file_full_path = os.path.join(settings.UPLOAD_DIR, doc.file_path)
    if os.path.exists(file_full_path):
        try:
            os.remove(file_full_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    auth.log_activity(db, current_user.id, "DOCUMENT_DELETE", f"Deleted document '{doc.file_name}' (ID: {document_id}).")
    return {"message": "Document deleted successfully.", "id": document_id}

@router.post("/decisions/{decision_id}/attachments", status_code=status.HTTP_201_CREATED)
def upload_decision_attachment(
    decision_id: int,
    file: UploadFile = File(...),
    comment_id: Optional[int] = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file_ext}'. Allowed types: PDF, DOCX, XLSX, PNG, JPG, JPEG."
        )

    try:
        contents = file.file.read()
        file_size = len(contents)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File size exceeds maximum 10 MB limit.")
        file.file.seek(0)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(dest_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Record as Document
    doc = models.Document(
        decision_id=decision_id,
        file_name=file.filename,
        file_path=unique_filename,
        file_type=file_ext.lstrip('.').upper(),
        file_size=file_size,
        uploaded_by=current_user.id
    )
    db.add(doc)

    # If associated with a comment, record Attachment
    if comment_id:
        att = models.Attachment(
            decision_id=decision_id,
            comment_id=comment_id,
            filename=file.filename,
            file_path=unique_filename,
            uploaded_by_id=current_user.id
        )
        db.add(att)

    db.commit()
    auth.log_activity(db, current_user.id, "UPLOAD_ATTACHMENT", f"Attached file '{file.filename}' to decision {decision_id}.", decision_id=decision_id)
    return {"message": "Attachment uploaded successfully.", "file_name": file.filename, "file_path": unique_filename}
