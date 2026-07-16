from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil

from app.database.database import get_db
from app.models.file_upload import FileUpload
from app.models.decision import Decision

router = APIRouter(
    prefix="/files",
    tags=["File Uploads"]
)

UPLOAD_FOLDER = "uploads"

ALLOWED_TYPES = [
    ".pdf",
    ".docx",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg"
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/")
def upload_file(
    decision_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check whether the decision exists
    decision = db.query(Decision).filter(
        Decision.id == decision_id
    ).first()

    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    # Validate file type
    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    # Validate file size
    contents = file.file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10 MB"
        )

    file.file.seek(0)

    # Create uploads folder
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save metadata
    new_file = FileUpload(
        file_name=file.filename,
        file_path=file_path,
        file_type=extension.replace(".", "").upper(),
        file_size=round(len(contents) / 1024, 2),
        decision_id=decision_id
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {
        "message": "File uploaded successfully",
        "file_id": new_file.id,
        "file_name": new_file.file_name,
        "file_type": new_file.file_type,
        "file_size": new_file.file_size
    }


@router.get("/")
def get_all_files(
    db: Session = Depends(get_db)
):
    return db.query(FileUpload).all()


@router.get("/{file_id}")
def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    file = db.query(FileUpload).filter(
        FileUpload.id == file_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return file


@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    file = db.query(FileUpload).filter(
        FileUpload.id == file_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    if not os.path.exists(file.file_path):
        raise HTTPException(
            status_code=404,
            detail="Physical file not found"
        )

    return FileResponse(
        path=file.file_path,
        filename=file.file_name,
        media_type="application/octet-stream"
    )


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    file = db.query(FileUpload).filter(
        FileUpload.id == file_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Delete physical file
    if os.path.exists(file.file_path):
        os.remove(file.file_path)

    # Delete database record
    db.delete(file)
    db.commit()

    return {
        "message": "File deleted successfully"
    }