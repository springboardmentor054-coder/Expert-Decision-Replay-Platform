from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.meeting_note import MeetingNote
from app.models.decision import Decision

from app.schemas.meeting_note import (
    MeetingNoteCreate,
    MeetingNoteResponse
)


router = APIRouter(
    prefix="/meeting-notes",
    tags=["Meeting Notes"]
)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post(
    "/",
    response_model=MeetingNoteResponse
)
def create_meeting_note(
    note: MeetingNoteCreate,
    db: Session = Depends(get_db)
):

    decision = db.query(Decision).filter(
        Decision.id == note.decision_id
    ).first()


    if not decision:
        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )


    new_note = MeetingNote(
        decision_id=note.decision_id,
        meeting_summary=note.meeting_summary,
        conclusion=note.conclusion,
        next_action=note.next_action
    )


    db.add(new_note)
    db.commit()
    db.refresh(new_note)


    return new_note



@router.get(
    "/decision/{decision_id}",
    response_model=list[MeetingNoteResponse]
)
def get_meeting_notes(
    decision_id: int,
    db: Session = Depends(get_db)
):

    notes = db.query(MeetingNote).filter(
        MeetingNote.decision_id == decision_id
    ).all()


    return notes