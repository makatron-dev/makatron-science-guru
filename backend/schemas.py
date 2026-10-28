from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date
from constants import (
    EDUCATION_LEVELS, SUBJECTS_BY_LEVEL, EXAM_TARGETS_BY_LEVEL,
    ALL_SUBJECTS, ALL_EXAM_TARGETS, DIFFICULTIES,
)

class RegisterRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=120)
    school_id: Optional[int] = None
    school_name: Optional[str] = None
    email: Optional[str] = None
    education_level: str
    exam_target: str
    subjects: List[str] = []
    password: str = Field(min_length=6, max_length=128)
    avatar_id: str = "default"
    referral_code: Optional[str] = None

    @field_validator("education_level")
    @classmethod
    def check_level(cls, v):
        if v not in EDUCATION_LEVELS: raise ValueError("bad level")
        return v

    @field_validator("exam_target")
    @classmethod
    def check_target(cls, v):
        if v not in ALL_EXAM_TARGETS: raise ValueError("bad target")
        return v

    def model_post_init(self, __context):
        allowed_subjects = SUBJECTS_BY_LEVEL[self.education_level]
        
        if self.education_level == "primary":
            self.subjects = ["general_science"]
        elif not self.subjects:
            self.subjects = allowed_subjects
        else:
            bad = set(self.subjects) - set(allowed_subjects)
            if bad: raise ValueError(f"subjects not allowed: {bad}")
            
        allowed_targets = EXAM_TARGETS_BY_LEVEL[self.education_level]
        if self.exam_target not in allowed_targets: raise ValueError("target not allowed")

class LoginRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    school_id: Optional[int] = None
    school_name: Optional[str] = None
    email: Optional[str] = None
    education_level: str
    exam_target: str
    subjects: List[str]
    avatar_id: str
    is_admin: bool
    role: str = "student"
    
    # --- PHASE 1 ADDITIONS ---
    xp: int = 0
    coins: int = 0
    active_title: str = "Scavenger"
    is_premium: bool = False
    premium_expires_at: Optional[datetime] = None
    avatar_expiry_date: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None

    # --- STREAK (DB-backed) ---
    last_login_date: Optional[date] = None
    current_streak: int = 0
    # -------------------------

    class Config:
        from_attributes = True

class RegisterResponse(BaseModel):
    user: UserOut
    token: str
    recovery_username: str
    referral_bonus: int = 0  # NEW: Coin reward from referral

class AdminResetPasswordRequest(BaseModel):
    user_id: int
    new_password: str = Field(min_length=6, max_length=128)

class AdminStudentUpdate(BaseModel):
    xp: Optional[int] = None
    coins: Optional[int] = None
    is_premium: Optional[bool] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    school_id: Optional[int] = None  # NEW: For B2B foundation

class RoleUpdateRequest(BaseModel):
    # NEW: Dedicated role-change schema (RBAC-gated endpoint)
    user_id: int
    role: str  # 'student' | 'teacher' | 'school_admin' | 'super_admin'
    school_id: Optional[int] = None

class GrantVaultItemRequest(BaseModel):
    user_id: int
    item_id: str

class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    school_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    education_level: Optional[str] = None
    exam_target: Optional[str] = None
    subjects: Optional[List[str]] = None
    avatar_id: Optional[str] = None

class QuestionOut(BaseModel):
    id: int
    exam_id: Optional[int] = None
    passage_id: Optional[int] = None
    education_level: str
    subject: str
    exam_target: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    time_to_answer_seconds: Optional[float] = None
    is_active: bool
    passage: Optional["PassageOut"] = None  # NEW: Inline passage for Light Paper rendering
    class Config:
        from_attributes = True

class QuestionUpsert(BaseModel):
    exam_id: Optional[int] = None
    passage_id: Optional[int] = None
    education_level: str
    subject: str
    exam_target: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str = "medium"
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

    @field_validator("education_level")
    @classmethod
    def chk_lvl(cls, v):
        if v not in EDUCATION_LEVELS: raise ValueError("bad level")
        return v

    @field_validator("subject")
    @classmethod
    def chk_sub(cls, v):
        if v not in ALL_SUBJECTS: raise ValueError("bad subject")
        return v

    @field_validator("correct_option")
    @classmethod
    def chk_correct(cls, v):
        if v.upper() not in ("A", "B", "C", "D"): raise ValueError("A/B/C/D only")
        return v.upper()

class StudyMaterialOut(BaseModel):
    id: int
    title: str
    subject: str
    education_level: str
    exam_target: Optional[str] = None
    drive_file_id: str
    description: Optional[str] = None
    is_active: bool
    class Config:
        from_attributes = True

class StudyMaterialUpsert(BaseModel):
    title: str
    subject: str
    education_level: str
    exam_target: Optional[str] = None
    drive_file_id: str
    description: Optional[str] = None
    is_active: bool = True

class ZoomSessionOut(BaseModel):
    id: int
    title: str
    subject: Optional[str] = None
    scheduled_at: str
    zoom_url: str
    description: Optional[str] = None

class ZoomSessionUpsert(BaseModel):
    title: str
    subject: Optional[str] = None
    scheduled_at: str
    zoom_url: str
    description: Optional[str] = None

class StartTestRequest(BaseModel):
    subject: str
    mode: str = "practice"
    exam_id: Optional[int] = None
    access_code: Optional[str] = None

class SubmitAnswer(BaseModel):
    question_id: int
    selected_option: Optional[str] = None
    time_spent_seconds: Optional[int] = None  # NEW: For Speed vs Accuracy analytics

class SubmitTestRequest(BaseModel):
    answers: List[SubmitAnswer]
    tab_switches: int = 0

class SettingsUpdate(BaseModel):
    platform_name: str
    support_email: str
    registration_open: bool
    maintenance_mode: bool
    announcement: Optional[str] = None
    allow_profile_edits: bool = True

class InitPaymentRequest(BaseModel):
    plan_type: str = "monthly" # 'monthly' or 'lifetime'

# --- NEW SCHEMAS ---

class SquadCreateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=100)

class SquadJoinRequest(BaseModel):
    invite_code: str

class SquadOut(BaseModel):
    id: int
    name: str
    invite_code: str
    creator_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReportQuestionRequest(BaseModel):
    reason: str = Field(description="E.g. typo, wrong_answer, image_missing")
    details: Optional[str] = None

class StagingQuestionOut(BaseModel):
    id: int
    upload_batch_id: str
    education_level: str
    subject: str
    exam_target: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None
    image_url: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

# --- FINAL 15-FEATURE SCHEMAS ---

class PassageOut(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    subject: str
    education_level: str
    exam_target: Optional[str] = None
    class Config:
        from_attributes = True

class PassageUpsert(BaseModel):
    title: Optional[str] = None
    content: str
    subject: str
    education_level: str
    exam_target: Optional[str] = None

class StudySessionOut(BaseModel):
    id: int
    device_name: str
    ip_address: Optional[str] = None
    last_active: datetime
    is_current: bool
    class Config:
        from_attributes = True

class BugReportRequest(BaseModel):
    description: str
    page_url: Optional[str] = None
    browser_info: Optional[str] = None

class HeartbeatRequest(BaseModel):
    is_fullscreen: bool = True

class ResolvePaymentRequest(BaseModel):
    reference: str
    action: str # 'success' or 'failed'

class ReviewMistakesRequest(BaseModel):
    # NEW: For Review Mistakes button on TestResultPage
    test_id: int