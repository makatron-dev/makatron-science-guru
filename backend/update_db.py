from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE msg_users ADD COLUMN IF NOT EXISTS email VARCHAR(120) UNIQUE;"))
    conn.execute(text("ALTER TABLE msg_users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100);"))
    conn.commit()
    print("Columns added successfully to msg_users")