from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator, model_validator
from typing import List, Optional, Any
import datetime
from backend.app.models import UserRole, DecisionStatus

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.EMPLOYEE
    team: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password cannot be empty or whitespace.")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    team: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserPublic):
    created_at: datetime.datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# ----------------- Alternative Schemas -----------------
class AlternativeBase(BaseModel):
    title: str
    description: str
    pros: Optional[List[str]] = Field(default_factory=list)
    cons: Optional[List[str]] = Field(default_factory=list)
    cost: float = 0.0
    feasibility_rating: int = Field(default=3, ge=1, le=5)
    risk_rating: int = Field(default=3, ge=1, le=5)
    risk_mitigation: Optional[str] = None

class AlternativeCreate(AlternativeBase):
    pass

class AlternativeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    cost: Optional[float] = None
    feasibility_rating: Optional[int] = Field(default=None, ge=1, le=5)
    risk_rating: Optional[int] = Field(default=None, ge=1, le=5)
    risk_mitigation: Optional[str] = None

class AlternativeResponse(AlternativeBase):
    id: int
    decision_id: int
    
    model_config = ConfigDict(from_attributes=True)

# ----------------- Attachment Schemas -----------------
class AttachmentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    uploaded_by_id: int
    uploaded_at: datetime.datetime
    
    model_config = ConfigDict(from_attributes=True)

# ----------------- Document Schemas -----------------
class DocumentBase(BaseModel):
    file_name: str
    file_type: str
    file_size: int

class DocumentCreate(DocumentBase):
    decision_id: int

class DocumentResponse(BaseModel):
    id: int
    decision_id: int
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by: int
    uploaded_at: datetime.datetime
    uploader: Optional[UserPublic] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Comment Schemas -----------------
class CommentBase(BaseModel):
    content: Optional[str] = None
    comment: Optional[str] = None
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    decision_id: Optional[int] = None

    @model_validator(mode='after')
    def validate_content_or_comment(self):
        text = self.content or self.comment
        if not text or not text.strip():
            raise ValueError("Comment cannot be empty.")
        if not self.content and self.comment:
            self.content = self.comment
        return self

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    comment: Optional[str] = None

    @model_validator(mode='after')
    def validate_content_or_comment(self):
        text = self.content or self.comment
        if not text or not text.strip():
            raise ValueError("Comment cannot be empty.")
        if not self.content and self.comment:
            self.content = self.comment
        return self

class CommentResponse(BaseModel):
    id: int
    decision_id: int
    user_id: int
    content: str
    comment: Optional[str] = None
    parent_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    user: UserPublic
    attachments: List[AttachmentResponse] = []
    replies: List["CommentResponse"] = []

    @model_validator(mode='after')
    def set_comment_field(self):
        if not self.comment and self.content:
            self.comment = self.content
        return self

    model_config = ConfigDict(from_attributes=True)

# ----------------- Meeting Notes Schemas -----------------
class MeetingNotesUpdate(BaseModel):
    meeting_summary: Optional[str] = None
    conclusion: Optional[str] = None
    next_action: Optional[str] = None

# ----------------- Approval Schemas -----------------
class ApprovalBase(BaseModel):
    approver_id: int
    level: int = 1

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalAction(BaseModel):
    status: str = Field(description="Approved or Rejected")
    comments: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: int
    decision_id: int
    level: int
    approver_id: int
    status: str
    comments: Optional[str] = None
    assigned_at: datetime.datetime
    actioned_at: Optional[datetime.datetime] = None
    approver: UserPublic

    model_config = ConfigDict(from_attributes=True)

# ----------------- Decision Version Schemas -----------------
class DecisionVersionCreate(BaseModel):
    change_summary: Optional[str] = "Version updated"
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class DecisionVersionResponse(BaseModel):
    id: int
    decision_id: int
    version: int
    version_number: int
    title: str
    problem_statement: Optional[str] = ""
    description: Optional[str] = ""
    category: Optional[str] = "Architecture"
    status: str
    changed_by_id: int
    modified_by_id: int
    change_summary: Optional[str] = None
    created_at: datetime.datetime
    modified_at: datetime.datetime
    changed_by: Optional[UserPublic] = None
    modified_by: Optional[UserPublic] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Decision Schemas -----------------
class DecisionBase(BaseModel):
    title: str
    problem_statement: str
    description: Optional[str] = None
    category: str = "Architecture"
    category_id: Optional[str] = None
    status: DecisionStatus = DecisionStatus.DRAFT

    @field_validator('title')
    def title_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator('problem_statement')
    def problem_statement_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Problem statement is mandatory")
        return v.strip()

class DecisionCreate(DecisionBase):
    alternatives: List[AlternativeCreate] = []
    required_approvers: List[ApprovalBase] = []

class DecisionUpdate(BaseModel):
    title: Optional[str] = None
    problem_statement: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[str] = None
    status: Optional[DecisionStatus] = None
    meeting_summary: Optional[str] = None
    conclusion: Optional[str] = None
    next_action: Optional[str] = None
    change_summary: Optional[str] = "Updated decision details"
    alternatives: Optional[List[AlternativeCreate]] = None

    @field_validator('title')
    def title_must_not_be_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip() if v is not None else v

    @field_validator('problem_statement')
    def problem_statement_must_not_be_empty_if_provided(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Problem statement cannot be empty")
        return v.strip() if v is not None else v

class DecisionResponse(DecisionBase):
    id: int
    current_version: int
    creator_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    creator: UserPublic

    model_config = ConfigDict(from_attributes=True)

class DecisionDetailResponse(DecisionResponse):
    meeting_summary: Optional[str] = None
    conclusion: Optional[str] = None
    next_action: Optional[str] = None
    alternatives: List[AlternativeResponse] = []
    comments: List[CommentResponse] = []
    attachments: List[AttachmentResponse] = []
    documents: List[DocumentResponse] = []
    approvals: List[ApprovalResponse] = []
    versions: List[DecisionVersionResponse] = []

    model_config = ConfigDict(from_attributes=True)

# ----------------- Audit Log Schemas -----------------
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    decision_id: Optional[int] = None
    action_type: str
    description: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime.datetime
    
    # Legacy fields
    action: Optional[str] = None
    details: Optional[str] = None
    timestamp: Optional[datetime.datetime] = None

    user: Optional[UserPublic] = None
    decision_title: Optional[str] = None

    @model_validator(mode='after')
    def sync_legacy_fields(self):
        if not self.action:
            self.action = self.action_type
        if not self.details:
            self.details = self.description
        if not self.timestamp:
            self.timestamp = self.created_at
        return self

    model_config = ConfigDict(from_attributes=True)

# ----------------- Report Schemas -----------------
class DecisionReportItem(BaseModel):
    id: int
    title: str
    category: str
    status: str
    created_by: str
    created_date: datetime.datetime

class DecisionReportResponse(BaseModel):
    total_decisions: int
    approved: int
    rejected: int
    pending: int
    records: List[DecisionReportItem]

class ApprovalReportItem(BaseModel):
    reviewer_name: str
    reviewer_email: str
    decisions_approved: int
    decisions_rejected: int
    pending_reviews: int

class ApprovalReportResponse(BaseModel):
    total_reviewers: int
    reviewers: List[ApprovalReportItem]

class TeamReportItem(BaseModel):
    team_name: str
    total_decisions: int
    total_users: int
    total_approvals: int

class TeamReportResponse(BaseModel):
    total_teams: int
    teams: List[TeamReportItem]

class AuditReportResponse(BaseModel):
    total_logins: int
    decisions_created: int
    documents_uploaded: int
    comments_added: int
    approval_actions: int

# ----------------- Notification Schemas -----------------
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: int
    decision_id: Optional[int] = None
    created_at: datetime.datetime
    user: Optional[UserPublic] = None

    model_config = ConfigDict(from_attributes=True)

class NotificationCountResponse(BaseModel):
    unread_count: int
    total_count: int

# Update forward references for nested schemas
CommentResponse.model_rebuild()
