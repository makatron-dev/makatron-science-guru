from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

load_dotenv()

from database import get_db, Base, engine
import models
from auth import hash_password, verify_password, create_access_token, generate_username
from schemas import (
    RegisterRequest, LoginRequest, UserOut, RegisterResponse,
    AdminResetPasswordRequest,
)
from deps import get_current_user, require_admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Makatron Science Guru API", version="0.1.0")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in origins:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"name": "Makatron Science Guru API", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/auth/register", response_model=RegisterResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    username = generate_username()
    while db.query(models.User).filter(models.User.username == username).first():
        username = generate_username()
    user = models.User(
        username=username,
        display_name=payload.display_name.strip(),
        password_hash=hash_password(payload.password),
        school_name=payload.school_name.strip(),
        class_level=payload.class_level,
        subjects=payload.subjects,
        avatar_id=payload.avatar_id or "default",
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.is_admin)
    return RegisterResponse(user=UserOut.model_validate(user), token=token, recovery_username=user.username)

@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="account disabled — contact admin")
    token = create_access_token(user.id, user.is_admin)
    return {"user": UserOut.model_validate(user), "token": token}

@app.get("/auth/me", response_model=UserOut)
def me(user: models.User = Depends(get_current_user)):
    return UserOut.model_validate(user)

@app.post("/admin/reset-password")
def admin_reset_password(
    payload: AdminResetPasswordRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    target = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="user not found")
    target.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"ok": True, "user_id": target.id}
