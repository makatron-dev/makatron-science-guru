import sys
from database import SessionLocal
import models
from auth import hash_password

if len(sys.argv) < 3:
    print("Usage: python reset_admin.py <username> <new_password>")
    sys.exit(1)

username = sys.argv[1]
new_password = sys.argv[2]

db = SessionLocal()
user = db.query(models.User).filter(models.User.username == username, models.User.is_admin == True).first()

if not user:
    print(f"Error: Admin user '{username}' not found.")
else:
    user.password_hash = hash_password(new_password)
    db.commit()
    print(f"Success! Password for {username} has been reset to: {new_password}")

db.close()