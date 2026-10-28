# backend/migrate.py
from database import engine
from sqlalchemy import text

def run_migration():
    print("Starting migration...")
    with engine.connect() as conn:
        # Check if columns exist before adding (PostgreSQL specific)
        try:
            conn.execute(text("ALTER TABLE msg_exams ADD COLUMN questions_to_serve INTEGER DEFAULT 0 NOT NULL;"))
            print("Added questions_to_serve")
        except Exception as e:
            print("questions_to_serve already exists or failed:", e)
            
        try:
            conn.execute(text("ALTER TABLE msg_exams ADD COLUMN randomize_questions BOOLEAN DEFAULT TRUE NOT NULL;"))
            print("Added randomize_questions")
        except Exception as e:
            print("randomize_questions already exists or failed:", e)

        try:
            conn.execute(text("ALTER TABLE msg_exams ADD COLUMN access_code VARCHAR(50);"))
            print("Added access_code")
        except Exception as e:
            print("access_code already exists or failed:", e)

        try:
            conn.execute(text("ALTER TABLE msg_exams ADD COLUMN instructions TEXT;"))
            print("Added instructions")
        except Exception as e:
            print("instructions already exists or failed:", e)
            
        conn.commit()
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()