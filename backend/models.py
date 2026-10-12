from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, ARRAY, UniqueConstraint
)
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "msg_users"
    id = Column(Integer, primary_key=True)
    username = Column(String(32), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    school_name = Column(String(200), nullable=False)
    class_level = Column(String(8), nullable=False)
    subjects = Column(ARRAY(String), nullable=False, default=list)
    avatar_id = Column(String(32), nullable=False, default="default")
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Question(Base):
    __tablename__ = "msg_questions"
    id = Column(Integer, primary_key=True)
    subject = Column(String(20), nullable=False, index=True)
    topic = Column(String(120), nullable=True)
    difficulty = Column(String(10), nullable=False, default="medium")
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)
    explanation = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class SubjectConfig(Base):
    __tablename__ = "msg_subjects_config"
    id = Column(Integer, primary_key=True)
    subject = Column(String(20), nullable=False, unique=True)
    question_count = Column(Integer, nullable=False, default=20)
    duration_seconds = Column(Integer, nullable=False, default=1200)
    marks_per_correct = Column(Integer, nullable=False, default=1)
    penalty_per_wrong = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Test(Base):
    __tablename__ = "msg_tests"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    subject = Column(String(20), nullable=False, index=True)
    question_count = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="in_progress")
    score = Column(Integer, nullable=True)
    tab_switches = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

class TestAnswer(Base):
    __tablename__ = "msg_test_answers"
    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("msg_tests.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("msg_questions.id"), nullable=False)
    selected_option = Column(String(1), nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ZoomSession(Base):
    __tablename__ = "msg_zoom_sessions"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(20), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    zoom_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
