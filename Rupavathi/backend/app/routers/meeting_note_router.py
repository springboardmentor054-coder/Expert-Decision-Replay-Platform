from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.meeting_note import MeetingNote
from app.models.decision import Decision
from app.models.user import User
from app.schemas.meeting_note_schema import (
    MeetingNoteCreate,
    MeetingNoteUpdate,
    MeetingNoteResponse,
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/meeting-notes", tags=["Meeting Notes"])


def _get_decision_or_404(db: Session, decision_id: int) -> Decision:
    decision = db.query(Decision).filter(Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


def _get_meeting_note_or_404(db: Session, note_id: int) -> MeetingNote:
    note = db.query(MeetingNote).filter(MeetingNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Meeting note not found")
    return note


# Create Meeting Note
@router.post("/", response_model=MeetingNoteResponse)
def create_meeting_note(
    payload: MeetingNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_decision_or_404(db, payload.decision_id)

    new_note = MeetingNote(
        decision_id=payload.decision_id,
        meeting_summary=payload.meeting_summary,
        conclusion=payload.conclusion,
        next_action=payload.next_action,
        created_by=current_user.id,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


# Get All Meeting Notes
@router.get("/", response_model=list[MeetingNoteResponse])
def get_all_meeting_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(MeetingNote).order_by(MeetingNote.created_at.asc()).all()


# Get Meeting Note By ID
@router.get("/{note_id}", response_model=MeetingNoteResponse)
def get_meeting_note(note_id: int, db: Session = Depends(get_db)):
    return _get_meeting_note_or_404(db, note_id)


# Update Meeting Note
@router.put("/{note_id}", response_model=MeetingNoteResponse)
def update_meeting_note(
    note_id: int,
    payload: MeetingNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_meeting_note_or_404(db, note_id)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)

    db.commit()
    db.refresh(note)

    return note


# Delete Meeting Note
@router.delete("/{note_id}")
def delete_meeting_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_meeting_note_or_404(db, note_id)

    db.delete(note)
    db.commit()

    return {"message": "Meeting note deleted successfully"}
