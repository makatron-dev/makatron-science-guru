from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE msg_email_logs ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;"))
    conn.commit()
    print("Added is_read column to msg_email_logs")