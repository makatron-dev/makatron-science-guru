# backend/reset_exams.py
from database import SessionLocal
import models

def wipe_exams():
    print("Connecting to database...")
    db = SessionLocal()
    try:
        print("Deleting test answers...")
        db.query(models.TestAnswer).delete()
        
        print("Deleting tests...")
        db.query(models.Test).delete()
        
        print("Deleting hall of fame...")
        db.query(models.HallOfFame).delete()
        
        print("Deleting questions...")
        db.query(models.Question).delete()
        
        print("Deleting exams...")
        db.query(models.Exam).delete()
        
        db.commit()
        print("✅ SUCCESS: All exam data wiped cleanly.")
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    wipe_exams()