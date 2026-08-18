import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.voice_recording import VoiceRecording
from app.models.notification import Notification
from app.models.user import User
from app.schemas.voice_recording import VoiceRecordingOut, AdminReplyRequest
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/voice-recordings", tags=["Voice Recordings"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "voice")
ALLOWED_AUDIO = {".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac"}

@router.post("", response_model=VoiceRecordingOut, status_code=status.HTTP_201_CREATED)
async def upload_voice(
    title: str = Form(...),
    decision_id: int = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_AUDIO:
        raise HTTPException(status_code=400, detail=f"Audio type '{ext}' not allowed")
    contents = await file.read()
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    save_name = f"{current_user.id}_{int(datetime.now().timestamp())}_{file.filename}"
    save_path = os.path.join(UPLOAD_DIR, save_name)
    with open(save_path, "wb") as f:
        f.write(contents)
    rec = VoiceRecording(title=title, decision_id=decision_id, file_path=save_path,
                          file_size=len(contents), uploaded_by=current_user.id)
    db.add(rec)
    # Notify admins
    from app.models.role import Role
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if admin_role:
        admins = db.query(User).filter(User.role_id == admin_role.id, User.is_active == True).all()
        for admin in admins:
            if admin.id != current_user.id:
                db.add(Notification(user_id=admin.id, decision_id=decision_id,
                                    title="New Voice Recording",
                                    message=f"{current_user.full_name} uploaded a recording: '{title}'"))
    db.commit()
    db.refresh(rec)
    return rec

@router.get("", response_model=list[VoiceRecordingOut])
def list_recordings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admins see all, others see their own
    from app.models.role import Role
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if admin_role and current_user.role_id == admin_role.id:
        return db.query(VoiceRecording).order_by(VoiceRecording.id.desc()).all()
    return db.query(VoiceRecording).filter(VoiceRecording.uploaded_by == current_user.id).order_by(VoiceRecording.id.desc()).all()

@router.get("/{recording_id}", response_model=VoiceRecordingOut)
def get_recording(recording_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    return rec

@router.get("/{recording_id}/download")
def download_recording(recording_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not rec or not os.path.exists(rec.file_path):
        raise HTTPException(status_code=404, detail="Recording not found")
    return FileResponse(rec.file_path, filename=os.path.basename(rec.file_path))

@router.put("/{recording_id}/reply", response_model=VoiceRecordingOut)
def admin_reply(recording_id: int, payload: AdminReplyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.role import Role
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if not admin_role or current_user.role_id != admin_role.id:
        raise HTTPException(status_code=403, detail="Only admins can reply")
    rec = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    rec.admin_reply = payload.reply
    rec.admin_replied_at = datetime.now(timezone.utc)
    rec.admin_replied_by = current_user.id
    # Notify the uploader
    db.add(Notification(user_id=rec.uploaded_by, title="Admin Replied to Your Recording",
                        message=f"Admin replied to your recording '{rec.title}': {payload.reply[:100]}"))
    db.commit()
    db.refresh(rec)
    return rec

@router.delete("/{recording_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recording(recording_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rec = db.query(VoiceRecording).filter(VoiceRecording.id == recording_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    if os.path.exists(rec.file_path):
        os.remove(rec.file_path)
    db.delete(rec)
    db.commit()
