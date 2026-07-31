from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

import os
import shutil

from app.database.connection import SessionLocal

from app.models.document import Document
from app.models.decision import Decision
from app.models.user import User

from app.schemas.document import DocumentResponse

from app.core.security import get_current_user

from app.utils.notification import create_notification
from app.utils.audit import create_audit_log


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# GET ALL DOCUMENTS
# ==========================================

@router.get(
    "/",
    response_model=list[DocumentResponse]
)
def get_documents(
    db: Session = Depends(get_db)
):

    return db.query(Document).all()


# ==========================================
# GET SINGLE DOCUMENT
# ==========================================

@router.get(
    "/{document_id}",
    response_model=DocumentResponse
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    return document


# ==========================================
# DELETE DOCUMENT
# ==========================================

@router.delete(
    "/{document_id}"
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    document = db.query(Document).filter(
        Document.id == document_id
    ).first()


    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    # ==========================================
    # DELETE PHYSICAL FILE
    # ==========================================

    if os.path.exists(document.file_path):

        os.remove(document.file_path)


    # ==========================================
    # DELETE DATABASE RECORD
    # ==========================================

    db.delete(document)

    db.commit()


    return {

        "message":
            "Document deleted successfully"

    }


# ==========================================
# GET DOCUMENTS BY DECISION
# ==========================================

@router.get(
    "/decision/{decision_id}",
    response_model=list[DocumentResponse]
)
def get_decision_documents(
    decision_id: int,
    db: Session = Depends(get_db)
):

    documents = db.query(Document).filter(
        Document.decision_id == decision_id
    ).all()


    return documents


# ==========================================
# UPLOAD DOCUMENT
# ==========================================

@router.post(
    "/upload"
)
def upload_document(
    decision_id: int = Form(...),
    uploaded_by: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # VERIFY DECISION EXISTS
    # ==========================================

    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()


    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    # ==========================================
    # ALLOWED FILE TYPES
    # ==========================================

    allowed_types = [

        "application/pdf",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "image/png",

        "image/jpeg"

    ]


    if file.content_type not in allowed_types:

        raise HTTPException(

            status_code=400,

            detail=
                "Only PDF, DOCX, XLSX, PNG and JPG files are allowed"

        )


    # ==========================================
    # MAXIMUM FILE SIZE = 10 MB
    # ==========================================

    MAX_FILE_SIZE = 10 * 1024 * 1024


    # ==========================================
    # CREATE UPLOADS FOLDER
    # ==========================================

    os.makedirs(
        "uploads",
        exist_ok=True
    )


    # ==========================================
    # FILE LOCATION
    # ==========================================

    file_location = (
        f"uploads/{file.filename}"
    )


    # ==========================================
    # SAVE FILE
    # ==========================================

    with open(
        file_location,
        "wb"
    ) as buffer:

        shutil.copyfileobj(

            file.file,

            buffer

        )


    # ==========================================
    # CHECK FILE SIZE
    # ==========================================

    file_size = os.path.getsize(
        file_location
    )


    if file_size > MAX_FILE_SIZE:

        os.remove(
            file_location
        )


        raise HTTPException(

            status_code=400,

            detail=
                "File size must be less than 10 MB"

        )


    # ==========================================
    # CREATE DOCUMENT RECORD
    # ==========================================

    new_document = Document(

        decision_id=
            decision_id,

        file_name=
            file.filename,

        file_path=
            file_location,

        file_type=
            file.content_type,

        file_size=
            file_size,

        uploaded_by=
            uploaded_by

    )


    db.add(
        new_document
    )


    # ==========================================
    # CREATE DOCUMENT AUDIT LOG
    # ==========================================

    create_audit_log(

        db=db,

        user_id=
            current_user.id,

        decision_id=
            decision.id,

        action_type=
            "DOCUMENT_UPLOADED",

        description=(
            f'Document "{file.filename}" '
            f'was uploaded to decision '
            f'"{decision.title}".'
        )
    )


    # ==========================================
    # CREATE DOCUMENT NOTIFICATION
    # ==========================================

    # Notify the decision creator
    # only if someone else uploads the document

    if decision.created_by != current_user.id:

        create_notification(

            db=db,

            user_id=
                decision.created_by,

            decision_id=
                decision.id,

            title=
                "New Document Uploaded",

            message=(
                f'A new document "{file.filename}" '
                f'has been uploaded to your decision '
                f'"{decision.title}".'
            )

        )


    # ==========================================
    # SAVE DOCUMENT + AUDIT LOG + NOTIFICATION
    # ==========================================

    db.commit()


    db.refresh(
        new_document
    )


    return {

        "message":
            "File uploaded successfully",

        "document_id":
            new_document.id

    }