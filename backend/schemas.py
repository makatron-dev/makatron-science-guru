from pydantic import BaseModel, Field, field_validator
from typing import List

ALLOWED_SUBJECTS = {"biology", "chemistry", "physics"}
ALLOWED_CLASSES = {"SS1", "SS2", "SS3"}

class RegisterRequest(BaseModel):
    display_name: str = Field(min_length=2, max_length=120)
    school_name: str = Field(min_length=2, max_length=200)
    class_level: str
    subjects: List[str]
    password: str = Field(min_length=6, max_length=128)
    avatar_id: str = "default"

    @field_validator("class_level")
    @classmethod
    def check_class(cls, v):
        if v not in ALLOWED_CLASSES:
            raise ValueError("class_level must be SS1, SS2, or SS3")
        return v

    @field_validator("subjects")
    @classmethod
    def check_subjects(cls, v):
        if not v:
            raise ValueError("pick at least one subject")
        normalized = [s.lower() for s in v]
        bad = set(normalized) - ALLOWED_SUBJECTS
        if bad:
            raise ValueError(f"unknown subjects: {bad}")
        return normalized

class LoginRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    school_name: str
    class_level: str
    subjects: List[str]
    avatar_id: str
    is_admin: bool

    class Config:
        from_attributes = True

class RegisterResponse(BaseModel):
    user: UserOut
    token: str
    recovery_username: str

class AdminResetPasswordRequest(BaseModel):
    user_id: int
    new_password: str = Field(min_length=6, max_length=128)
