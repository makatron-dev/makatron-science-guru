from database import SessionLocal
import models
from auth import hash_password

db = SessionLocal()
existing = db.query(models.User).filter(models.User.is_admin == True).first()
if existing:
    print("Admin already exists:", existing.username)
else:
    admin = models.User(
        username="MSG-ADMIN1",
        display_name="Admin",
        password_hash=hash_password("changeme123"),
        school_name="Makatron",
        education_level="senior",
        exam_target="jamb",
        subjects=["biology", "chemistry", "physics"],
        avatar_id="default",
        is_active=True,
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    print("Admin created: MSG-ADMIN1 / changeme123")
db.close()