from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required.")

# Neon (and most managed Postgres) require SSL. If the URL doesn't include an
# sslmode parameter, add sslmode=require unless you're pointing at localhost.
_is_local = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL
_connect_args = {}
if not _is_local and "sslmode=" not in DATABASE_URL:
    _connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # detect dead connections before use (Neon closes idle ones)
    pool_recycle=300,       # recycle connections every 5 minutes
    pool_size=5,            # base pool size
    max_overflow=10,        # allow spikes up to pool_size + max_overflow
    future=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
    expire_on_commit=False,  # lets FastAPI return ORM objects after commit without re-query
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()