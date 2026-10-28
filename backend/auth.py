import bcrypt
import jwt
import secrets
import string
import os
from datetime import datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# JWT configuration
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "").strip()
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

# Refuse to run in production without a real secret. Developers can opt into
# the insecure default by setting ENV=development explicitly.
_ENV = os.getenv("ENV", "production").lower()
if not JWT_SECRET:
    if _ENV in ("development", "dev", "local"):
        JWT_SECRET = "dev-secret-change-me-later"
        print("[auth] WARNING: JWT_SECRET not set; using dev default. Do not use in production.")
    else:
        raise RuntimeError(
            "JWT_SECRET environment variable is required. "
            "Set it to a long random string (e.g. `openssl rand -hex 32`)."
        )

if len(JWT_SECRET) < 32 and _ENV not in ("development", "dev", "local"):
    print("[auth] WARNING: JWT_SECRET is shorter than 32 characters. Use a longer secret in production.")


# ---------------------------------------------------------------------------
# Passwords
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Tokens
# ---------------------------------------------------------------------------
def create_access_token(user_id: int, is_admin: bool = False) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "admin": bool(is_admin),
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.PyJWTError:
        return None


# ---------------------------------------------------------------------------
# Username generation
# ---------------------------------------------------------------------------
def generate_username() -> str:
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(6))
    return f"MSG-{suffix}"