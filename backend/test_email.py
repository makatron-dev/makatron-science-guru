import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

email = os.getenv("SMTP_EMAIL")
password = os.getenv("SMTP_PASSWORD")

print(f"Testing connection for: {email}")
print(f"Password length: {len(password) if password else 'MISSING'}")

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(email, password)
    print("LOGIN SUCCESSFUL!")
    
    msg = MIMEText("This is a test email from Makatron.")
    msg["Subject"] = "Makatron Test Email"
    msg["From"] = email
    msg["To"] = email
    
    server.sendmail(email, [email], msg.as_string())
    print("EMAIL SENT SUCCESSFULLY!")
    server.quit()
except Exception as e:
    print(f"FAILED: {e}")