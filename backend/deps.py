from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from auth import decode_access_token
import models

security = HTTPBearer(auto_error=False)

def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    if creds is None:
        raise HTTPException(status_code=401, detail="not authenticated")
    payload = decode_access_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid or expired token")
    user_id = int(payload.get("sub", "0"))
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="user not found or inactive")
    return user

def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="admin only")
    return user
