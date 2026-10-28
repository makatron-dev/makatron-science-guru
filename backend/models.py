from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, ARRAY, UniqueConstraint, Index, Float, Date
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from database import Base

# ==========================================
# NEW: SCHOOLS
# ==========================================
class School(Base):
    __tablename__ = "msg_schools"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    state = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class User(Base):
    __tablename__ = "msg_users"
    id = Column(Integer, primary_key=True)
    username = Column(String(32), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # School linkage
    school_id = Column(Integer, ForeignKey("msg_schools.id"), nullable=True, index=True)
    school_name = Column(String(200), nullable=True)
    
    # Referral
    referred_by_id = Column(Integer, ForeignKey("msg_users.id"), nullable=True)
    
    email = Column(String(120), nullable=True, unique=True, index=True)
    reset_token = Column(String(100), nullable=True)
    education_level = Column(String(16), nullable=False, index=True)
    exam_target = Column(String(32), nullable=False, index=True)
    subjects = Column(ARRAY(String), nullable=False, default=list)
    avatar_id = Column(String(32), nullable=False, default="default")
    is_active = Column(Boolean, nullable=False, default=True)
    is_admin = Column(Boolean, nullable=False, default=False)
    
    # --- PHASE 1 ADDITIONS ---
    xp = Column(Integer, nullable=False, default=0)
    coins = Column(Integer, nullable=False, default=0)
    active_title = Column(String(50), nullable=False, default="Scavenger")
    is_premium = Column(Boolean, nullable=False, default=False)
    premium_expires_at = Column(DateTime(timezone=True), nullable=True)
    avatar_expiry_date = Column(DateTime(timezone=True), nullable=True)
    total_study_time = Column(Integer, nullable=False, default=0)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True) # NEW: 7-day trial tracker
    
    # --- NEW: ROLE ---
    role = Column(String(20), nullable=False, default="student") # 'student', 'teacher', 'school_admin'
    # -------------------------

    # --- NEW: STREAK TRACKING (DB-backed) ---
    last_login_date = Column(Date, nullable=True)
    current_streak = Column(Integer, nullable=False, default=0)
    # ---------------------------------------
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class UserInventory(Base):
    __tablename__ = "msg_user_inventory"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    item_id = Column(String(50), nullable=False, index=True) # e.g. 'avatar_hacker', 'ai_pass'
    item_type = Column(String(20), nullable=False) # 'avatar', 'title', 'powerup'
    purchased_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Transaction(Base):
    __tablename__ = "msg_transactions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    reference = Column(String(100), unique=True, nullable=False, index=True) # Paystack ref
    amount = Column(Float, nullable=False)
    plan_type = Column(String(20), nullable=False) # 'monthly', 'lifetime'
    status = Column(String(20), nullable=False, default="pending") # 'success', 'failed', 'pending'
    paid_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    retry_count = Column(Integer, nullable=False, default=0) # NEW: for retry logic
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class StudyMaterial(Base):
    __tablename__ = "msg_study_materials"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(32), nullable=False, index=True)
    education_level = Column(String(16), nullable=False, index=True)
    exam_target = Column(String(32), nullable=True, index=True)
    drive_file_id = Column(String(200), nullable=False) # The Google Drive File ID
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Settings(Base):
    __tablename__ = "msg_settings"
    id = Column(Integer, primary_key=True)
    platform_name = Column(String(120), nullable=False, default="MAKAVERSE EDTECH")
    support_email = Column(String(120), nullable=False, default="support@makaverseedtech.com")
    registration_open = Column(Boolean, nullable=False, default=True)
    maintenance_mode = Column(Boolean, nullable=False, default=False)
    announcement = Column(Text, nullable=True)
    
    allow_profile_edits = Column(Boolean, nullable=False, default=True)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class ActivityLog(Base):
    __tablename__ = "msg_activity_logs"
    id = Column(Integer, primary_key=True)
    action_type = Column(String(50), nullable=False)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Exam(Base):
    __tablename__ = "msg_exams"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    exam_type = Column(String(20), nullable=False, default="mock")
    education_level = Column(String(16), nullable=False)
    subject = Column(String(32), nullable=False)
    duration_mins = Column(Integer, nullable=False, default=60)
    pass_percent = Column(Integer, nullable=False, default=40)
    total_marks = Column(Integer, nullable=False, default=100)
    
    questions_to_serve = Column(Integer, nullable=False, default=0) 
    randomize_questions = Column(Boolean, nullable=False, default=True)
    access_code = Column(String(50), nullable=True)
    instructions = Column(Text, nullable=True)
    
    is_active = Column(Boolean, nullable=False, default=True)
    add_to_bank = Column(Boolean, nullable=False, default=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class HallOfFame(Base):
    __tablename__ = "msg_hall_of_fame"
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("msg_exams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False)
    rank = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

# ==========================================
# NEW: PASSAGES (Comprehension)
# ==========================================
class Passage(Base):
    __tablename__ = "msg_passages"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    subject = Column(String(32), nullable=False, index=True)
    education_level = Column(String(16), nullable=False, index=True)
    exam_target = Column(String(32), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Question(Base):
    __tablename__ = "msg_questions"
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("msg_exams.id"), nullable=True, index=True)
    passage_id = Column(Integer, ForeignKey("msg_passages.id"), nullable=True, index=True) # NEW: Comprehension
    education_level = Column(String(16), nullable=False, index=True)
    subject = Column(String(32), nullable=False, index=True)
    exam_target = Column(String(32), nullable=True, index=True)
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
    
    # NEW: Diagram support
    image_url = Column(String(500), nullable=True)
    # NEW: For speed analytics
    time_to_answer_seconds = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class Test(Base):
    __tablename__ = "msg_tests"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("msg_exams.id"), nullable=True)
    subject = Column(String(32), nullable=False, index=True)
    mode = Column(String(20), nullable=False, default="practice")
    education_level = Column(String(16), nullable=False)
    exam_target = Column(String(32), nullable=True)
    question_count = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="in_progress")
    score = Column(Integer, nullable=True)
    tab_switches = Column(Integer, nullable=False, default=0)
    time_taken_seconds = Column(Integer, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

class TestAnswer(Base):
    __tablename__ = "msg_test_answers"
    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("msg_tests.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("msg_questions.id"), nullable=False)
    selected_option = Column(String(1), nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)

class EmailLog(Base):
    __tablename__ = "msg_email_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=True, index=True)
    recipient = Column(String(120), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    reply = Column(Text, nullable=True) 
    replied_at = Column(DateTime(timezone=True), nullable=True) 
    status = Column(String(20), default="sent")
    is_read = Column(Boolean, nullable=False, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class ZoomSession(Base):
    __tablename__ = "msg_zoom_sessions"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(32), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    zoom_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class TickerNews(Base):
    __tablename__ = "msg_ticker_news"
    id = Column(Integer, primary_key=True)
    headline = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class DailyChallengeLog(Base):
    __tablename__ = "msg_daily_challenge_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), index=True)
    challenge_date = Column(String, index=True)
    is_correct = Column(Boolean, default=False)

class QuestionBookmark(Base):
    __tablename__ = "msg_question_bookmarks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("msg_questions.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'question_id', name='uq_user_question_bookmark'),)

# ==========================================
# NEW: SQUADS
# ==========================================
class Squad(Base):
    __tablename__ = "msg_squads"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    invite_code = Column(String(20), unique=True, nullable=False, index=True)
    creator_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class SquadMember(Base):
    __tablename__ = "msg_squad_members"
    id = Column(Integer, primary_key=True)
    squad_id = Column(Integer, ForeignKey("msg_squads.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint('squad_id', 'user_id', name='uq_squad_member'),)

# ==========================================
# NEW: REPORTED QUESTIONS
# ==========================================
class ReportedQuestion(Base):
    __tablename__ = "msg_reported_questions"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("msg_questions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False)
    reason = Column(String(50), nullable=False) # 'typo', 'wrong_answer', 'image_missing', 'other'
    details = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending") # 'pending', 'resolved', 'dismissed'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

# ==========================================
# NEW: STAGING QUESTIONS (For safe CSV uploads)
# ==========================================
class StagingQuestion(Base):
    __tablename__ = "msg_staging_questions"
    id = Column(Integer, primary_key=True)
    upload_batch_id = Column(String(50), nullable=False, index=True) # Groups questions uploaded together
    education_level = Column(String(16), nullable=False)
    subject = Column(String(32), nullable=False)
    exam_target = Column(String(32), nullable=True)
    topic = Column(String(120), nullable=True)
    difficulty = Column(String(10), nullable=False, default="medium")
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(1), nullable=False)
    explanation = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), nullable=False, default="pending") # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

# ==========================================
# NEW: STUDY SESSIONS (For Active Devices)
# ==========================================
class StudySession(Base):
    __tablename__ = "msg_study_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("msg_users.id"), nullable=False, index=True)
    device_name = Column(String(100), nullable=False)  # e.g. "Chrome on Windows"
    ip_address = Column(String(50), nullable=True)
    last_active = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_current = Column(Boolean, nullable=False, default=False)