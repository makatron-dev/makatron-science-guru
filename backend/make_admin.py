# backend/make_admin.py
from database import SessionLocal
import models
from auth import hash_password

def create_or_upgrade_admin(username, password, display_name="Master Admin"):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        
        if user:
            user.is_admin = True
            user.password_hash = hash_password(password)
            print(f"✅ SUCCESS: User '{username}' found and upgraded to Admin.")
        else:
            user = models.User(
                username=username,
                display_name=display_name,
                password_hash=hash_password(password),
                school_name="Makatron HQ",
                email="admin@makatron.com",
                education_level="senior",
                exam_target="jamb",
                subjects=["biology"], # Default
                avatar_id="default",
                is_active=True,
                is_admin=True,
            )
            db.add(user)
            print(f"✅ SUCCESS: Created new Admin account '{username}'.")
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # We are creating the special account you wanted
    create_or_upgrade_admin(
        username="MSG-ADMIN1", 
        password="MakatronAdmin2026!", # You can change this password
        display_name="Master Admin"
    )