from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil

from app.database.connection import SessionLocal
from app.models.document import Document
from app.schemas.document import DocumentResponse


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.get("/", response_model=list[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):

    return db.query(Document).all()



@router.get("/{document_id}", response_model=DocumentResponse)
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



@router.delete("/{document_id}")
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


    # Delete file from uploads folder

    if os.path.exists(document.file_path):

        os.remove(document.file_path)


    db.delete(document)

    db.commit()


    return {
        "message": "Document deleted successfully"
    }




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





@router.post("/upload")
def upload_document(
    decision_id: int = Form(...),
    uploaded_by: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):


    # Allowed file types

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

            detail="Only PDF, DOCX, XLSX, PNG and JPG files are allowed"

        )



    # Maximum file size = 10 MB

    MAX_FILE_SIZE = 10 * 1024 * 1024



    file_location = f"uploads/{file.filename}"



    with open(file_location, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )



    # Check file size after upload

    file_size = os.path.getsize(file_location)



    if file_size > MAX_FILE_SIZE:


        os.remove(file_location)


        raise HTTPException(

            status_code=400,

            detail="File size must be less than 10 MB"

        )




    new_document = Document(

        decision_id=decision_id,

        file_name=file.filename,

        file_path=file_location,

        file_type=file.content_type,

        file_size=file_size,

        uploaded_by=uploaded_by

    )



    db.add(new_document)

    db.commit()

    db.refresh(new_document)



    return {

        "message": "File uploaded successfully",

        "document_id": new_document.id

    }