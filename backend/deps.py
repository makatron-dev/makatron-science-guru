from fastapi import Depends, HTTPException
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
        raise HTTPException(status_code=401, detail="Not authenticated.")
    payload = decode_access_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    try:
        user_id = int(payload.get("sub", "0"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Malformed token.")
    if user_id <= 0:
        raise HTTPException(status_code=401, detail="Malformed token.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive.")
    return user


ADMIN_ROLES = ("school_admin", "super_admin")


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    """
    Allows access to /admin/* if ANY of the following is true:
      - user.is_admin is True (legacy/global admin flag)
      - user.role is "school_admin" or "super_admin"
    Per-endpoint scoping (e.g. school_admin sees only their school) is enforced
    in main.py via `_scoped_*` helpers.
    """
    if user.is_admin:
        return user
    if user.role in ADMIN_ROLES:
        return user
    raise HTTPException(status_code=403, detail="Admin access required.")


def require_super_admin(user: models.User = Depends(get_current_user)) -> models.User:
    """
    Stricter gate for platform-wide operations (settings, ticker, payments,
    cross-school user management, staging approval, report resolution, exam
    creation/deletion, zoom scheduling).
    """
    if user.role == "super_admin":
        return user
    if user.is_admin:
        return user
    raise HTTPException(status_code=403, detail="Super admin access required.")


def is_school_scoped(user: models.User) -> bool:
    """True if this admin should only see data for their own school."""
    return (
        not user.is_admin
        and user.role == "school_admin"
        and user.school_id is not None
    )