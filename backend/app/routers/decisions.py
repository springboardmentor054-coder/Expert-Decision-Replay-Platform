from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.config import settings

ALLOWED_ATTACHMENT_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg", ".gif", ".webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

router = APIRouter(prefix="/decisions", tags=["Decisions"])

@router.post("/", response_model=schemas.DecisionDetailResponse, status_code=status.HTTP_201_CREATED)
def create_decision(
    decision_in: schemas.DecisionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Create Decision
    db_decision = models.Decision(
        title=decision_in.title,
        problem_statement=decision_in.problem_statement,
        description=decision_in.description,
        category=decision_in.category,
        category_id=decision_in.category_id or decision_in.category,
        status=decision_in.status.value,
        current_version=1,
        creator_id=current_user.id
    )
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)

    # 2. Add Alternatives
    for alt_in in decision_in.alternatives:
        db_alt = models.Alternative(
            decision_id=db_decision.id,
            title=alt_in.title,
            description=alt_in.description,
            pros=alt_in.pros,
            cons=alt_in.cons,
            cost=alt_in.cost,
            feasibility_rating=alt_in.feasibility_rating,
            risk_rating=alt_in.risk_rating,
            risk_mitigation=alt_in.risk_mitigation
        )
        db.add(db_alt)

    # 3. Add Required Approvers (Workflows)
    for app_in in decision_in.required_approvers:
        db_approval = models.Approval(
            decision_id=db_decision.id,
            level=app_in.level,
            approver_id=app_in.approver_id,
            status="Pending"
        )
        db.add(db_approval)

    # 4. Save Version History
    db_version = models.DecisionVersion(
        decision_id=db_decision.id,
        version=1,
        title=db_decision.title,
        problem_statement=db_decision.problem_statement,
        category=db_decision.category,
        status=db_decision.status,
        changed_by_id=current_user.id,
        change_summary="Initial creation"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(db_decision)
    
    auth.log_activity(
        db, current_user.id, "CREATE_DECISION", 
        f"Created decision '{db_decision.title}' (ID: {db_decision.id}) in category '{db_decision.category}'",
        decision_id=db_decision.id
    )

    # Notify assigned approvers
    for app_in in decision_in.required_approvers:
        try:
            auth.create_notification(
                db, app_in.approver_id,
                "New Approval Assignment",
                f"You have been assigned to review decision: '{db_decision.title}'",
                "approval_assigned",
                decision_id=db_decision.id
            )
        except Exception:
            pass  # Don't fail decision creation if notification fails
    
    return db_decision

@router.get("/", response_model=List[schemas.DecisionResponse])
def get_decisions(
    category: Optional[str] = None,
    status: Optional[str] = None,
    creator_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Decision)
    
    if category:
        query = query.filter(models.Decision.category == category)
    if status:
        query = query.filter(models.Decision.status == status)
    if creator_id:
        query = query.filter(models.Decision.creator_id == creator_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            models.Decision.title.like(search_filter) | 
            models.Decision.problem_statement.like(search_filter)
        )
        
    return query.order_by(models.Decision.updated_at.desc()).all()

@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Decision.category).distinct().all()
    cat_list = [c[0] for c in categories if c[0]]
    if not cat_list:
        cat_list = ["Architecture", "Infrastructure", "Product Strategy", "Procurement", "Compliance", "Security"]
    return cat_list

@router.get("/{decision_id}", response_model=schemas.DecisionDetailResponse)
def get_decision(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
    return decision

@router.put("/{decision_id}", response_model=schemas.DecisionDetailResponse)
def update_decision(
    decision_id: int,
    decision_in: schemas.DecisionUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    # Check permissions (creator or Admin or Manager)
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this decision.")

    # Prevent edit of Approved/Archived unless Manager/Admin
    if decision.status in ["Approved", "Archived"] and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail=f"Cannot edit a decision in status {decision.status}")

    # Determine if we should create a new version
    is_modified = False
    
    if decision_in.title is not None and decision_in.title != decision.title:
        decision.title = decision_in.title
        is_modified = True
    if decision_in.problem_statement is not None and decision_in.problem_statement != decision.problem_statement:
        decision.problem_statement = decision_in.problem_statement
        is_modified = True
    if decision_in.description is not None and decision_in.description != decision.description:
        decision.description = decision_in.description
        is_modified = True
    if decision_in.category is not None and decision_in.category != decision.category:
        decision.category = decision_in.category
        is_modified = True
    if decision_in.category_id is not None and decision_in.category_id != decision.category_id:
        decision.category_id = decision_in.category_id
        is_modified = True
    if decision_in.status is not None and decision_in.status.value != decision.status:
        decision.status = decision_in.status.value
        is_modified = True
    if decision_in.meeting_summary is not None and decision_in.meeting_summary != decision.meeting_summary:
        decision.meeting_summary = decision_in.meeting_summary
        is_modified = True
    if decision_in.conclusion is not None and decision_in.conclusion != decision.conclusion:
        decision.conclusion = decision_in.conclusion
        is_modified = True
    if decision_in.next_action is not None and decision_in.next_action != decision.next_action:
        decision.next_action = decision_in.next_action
        is_modified = True

    # Handle replacement of alternatives if provided
    if decision_in.alternatives is not None:
        db.query(models.Alternative).filter(models.Alternative.decision_id == decision.id).delete()
        for alt_in in decision_in.alternatives:
            db_alt = models.Alternative(
                decision_id=decision.id,
                title=alt_in.title,
                description=alt_in.description,
                pros=alt_in.pros,
                cons=alt_in.cons,
                cost=alt_in.cost,
                feasibility_rating=alt_in.feasibility_rating,
                risk_rating=alt_in.risk_rating,
                risk_mitigation=alt_in.risk_mitigation
            )
            db.add(db_alt)
        is_modified = True

    if is_modified:
        decision.current_version += 1
        db_version = models.DecisionVersion(
            decision_id=decision.id,
            version=decision.current_version,
            title=decision.title,
            problem_statement=decision.problem_statement,
            category=decision.category,
            status=decision.status,
            changed_by_id=current_user.id,
            change_summary=decision_in.change_summary
        )
        db.add(db_version)
        db.commit()
        db.refresh(decision)
        
        auth.log_activity(
            db, current_user.id, "UPDATE_DECISION", 
            f"Updated decision '{decision.title}' to Version {decision.current_version}. Change summary: {decision_in.change_summary}",
            decision_id=decision.id
        )
    
    return decision

@router.delete("/{decision_id}", status_code=status.HTTP_200_OK)
def delete_decision(
    decision_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this decision.")

    db.delete(decision)
    db.commit()
    auth.log_activity(db, current_user.id, "DELETE_DECISION", f"Deleted decision '{decision.title}' (ID: {decision_id}).", decision_id=decision_id)
    return {"message": "Decision deleted successfully.", "id": decision_id}

@router.put("/{decision_id}/meeting-notes", response_model=schemas.DecisionDetailResponse)
def update_meeting_notes(
    decision_id: int,
    notes_in: schemas.MeetingNotesUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if notes_in.meeting_summary is not None:
        decision.meeting_summary = notes_in.meeting_summary
    if notes_in.conclusion is not None:
        decision.conclusion = notes_in.conclusion
    if notes_in.next_action is not None:
        decision.next_action = notes_in.next_action
        
    db.commit()
    db.refresh(decision)
    auth.log_activity(db, current_user.id, "MEETING_NOTES_UPDATE", f"Updated meeting notes for decision '{decision.title}'.")
    return decision

@router.get("/{decision_id}/documents", response_model=List[schemas.DocumentResponse])
def get_decision_documents(decision_id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
    return db.query(models.Document).filter(models.Document.decision_id == decision_id).order_by(models.Document.uploaded_at.desc()).all()

@router.post("/{decision_id}/submit-review", response_model=schemas.DecisionDetailResponse)
def submit_decision_for_review(
    decision_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to submit this decision.")

    if decision.status != "Draft":
        raise HTTPException(status_code=400, detail="Only Draft decisions can be submitted for review.")

    approvals_count = db.query(models.Approval).filter(models.Approval.decision_id == decision.id).count()
    if approvals_count == 0:
        raise HTTPException(status_code=400, detail="Cannot submit for review without assigning at least one approver.")

    decision.status = "Under Review"
    
    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary="Submitted for review"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(decision)
    
    auth.log_activity(db, current_user.id, "DECISION_SUBMIT_REVIEW", f"Submitted decision '{decision.title}' for review.")
    return decision

@router.post("/{decision_id}/archive", response_model=schemas.DecisionDetailResponse)
def archive_decision(
    decision_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to archive this decision.")

    decision.status = "Archived"
    
    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary="Archived decision"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(decision)
    
    auth.log_activity(db, current_user.id, "DECISION_ARCHIVE", f"Archived decision '{decision.title}'.")
    return decision

@router.get("/{decision_id}/versions", response_model=List[schemas.DecisionVersionResponse])
def get_decision_versions(
    decision_id: int,
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
    
    versions = db.query(models.DecisionVersion).filter(
        models.DecisionVersion.decision_id == decision_id
    ).order_by(models.DecisionVersion.version.desc()).all()
    return versions

@router.post("/{decision_id}/versions", response_model=schemas.DecisionVersionResponse, status_code=status.HTTP_201_CREATED)
def create_decision_version(
    decision_id: int,
    version_in: schemas.DecisionVersionCreate = schemas.DecisionVersionCreate(),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this decision.")

    if version_in.title and version_in.title.strip():
        decision.title = version_in.title.strip()
    if version_in.description and version_in.description.strip():
        decision.problem_statement = version_in.description.strip()
    if version_in.status and version_in.status.strip():
        decision.status = version_in.status.strip()

    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary=version_in.change_summary or f"Manual version snapshot v{decision.current_version}"
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    db.refresh(decision)

    auth.log_activity(
        db, current_user.id, "DECISION_VERSION_CREATE",
        f"Created version {db_version.version} for decision {decision_id}."
    )
    return db_version


@router.post("/{decision_id}/attachments", status_code=status.HTTP_201_CREATED)
def upload_decision_attachment(
    decision_id: int,
    file: UploadFile = File(...),
    comment_id: Optional[int] = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail=f"Decision with ID {decision_id} does not exist.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file_ext}'. Allowed file formats: PDF, DOCX, XLSX, PNG, JPG, JPEG, GIF, WEBP."
        )

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

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    try:
        with open(dest_path, "wb") as buffer:
            buffer.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file on server: {str(e)}")

    # Create Document entry
    doc = models.Document(
        decision_id=decision_id,
        file_name=file.filename,
        file_path=unique_filename,
        file_type=file_ext.lstrip('.').upper(),
        file_size=file_size,
        uploaded_by=current_user.id
    )
    db.add(doc)

    # If associated with a comment, create Attachment entry
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
    auth.log_activity(
        db, current_user.id, "UPLOAD_DOCUMENT",
        f"Uploaded document '{doc.file_name}' ({doc.file_size} bytes) for decision {decision_id}.",
        decision_id=decision_id
    )
    return {"message": "Attachment uploaded successfully.", "file_name": file.filename, "file_path": unique_filename}


