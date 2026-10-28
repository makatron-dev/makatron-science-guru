from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("DATABASE_URL")
if not url:
    raise SystemExit("DATABASE_URL missing from .env")
print(f"URL prefix: {url[:45]}...")

engine = create_engine(url)
with engine.connect() as conn:
    version = conn.execute(text("SELECT version()")).scalar()
    print("Connected:", version)
    tables = conn.execute(text("""
        SELECT tablename FROM pg_tables
        WHERE schemaname='public' ORDER BY tablename
    """)).fetchall()
    print("Existing tables:", [t[0] for t in tables])
