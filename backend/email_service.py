import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def _send_real_email(to_email, subject, html_body):
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"[EMAIL SKIPPED] SMTP credentials missing. Would have sent to {to_email}")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"MAKAVERSE <{SMTP_EMAIL}>"
        msg["To"] = to_email
        
        part = MIMEText(html_body, "html")
        msg.attach(part)
        
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Base Template for all emails
def _build_email(title, content_html):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #050a14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050a14; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0a1424; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4); border: 1px solid #101d31;">
                        <!-- HEADER -->
                        <tr>
                            <td align="center" style="padding: 48px 40px 32px;">
                                <!-- The Squircle Logo -->
                                <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #00d4ff, #a855f7); border-radius: 20px; box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3); margin-bottom: 20px; position: relative;">
                                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%); border-radius: 20px;"></div>
                                    <div style="font-size: 32px; font-weight: 900; color: #ffffff; line-height: 64px; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">M</div>
                                </div>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">MAKA<span style="color: #00d4ff;">VERSE</span></h1>
                                <p style="margin: 4px 0 0; color: #8ba8bd; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">EdTech</p>
                            </td>
                        </tr>
                        
                        <!-- CONTENT -->
                        <tr>
                            <td style="padding: 0 40px 40px;">
                                <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.2;">{title}</h2>
                                <div style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                                    {content_html}
                                </div>
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td align="center" style="padding: 32px 40px; background-color: #101d31; border-top: 1px solid #1e3444;">
                                <p style="margin: 0 0 16px; color: #8ba8bd; font-size: 14px;">The Gold Standard for Science CBT.</p>
                                <p style="margin: 0; color: #5a7a92; font-size: 12px;">
                                    © {2026} MAKAVERSE EdTech. All rights reserved.<br>
                                    If you didn't request this email, please ignore it.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

# 1. Welcome Email
def send_welcome_email(email, display_name, username):
    if not email: return
    subject = "Welcome to the MAKAVERSE 🚀"
    
    content = f"""
    <p style="margin-top: 0;">Hello <strong style="color: #ffffff;">{display_name}</strong>,</p>
    <p>Welcome to the premier CBT platform for Nigerian science students. Your account has been created successfully and your journey to excellence starts now.</p>
    
    <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.05)); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
        <p style="margin: 0 0 8px; color: #8ba8bd; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Your Username</p>
        <p style="margin: 0; color: #00d4ff; font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 2px;">{username}</p>
    </div>
    
    <p><strong style="color: #ffffff;">Please save this username safely.</strong> You will need it to log in every time.</p>
    
    <div style="margin: 32px 0;">
        <p style="margin: 0 0 12px; color: #ffffff; font-weight: 700;">Here is what you can do right now:</p>
        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
            <li style="margin-bottom: 8px;">Take a <strong style="color: #ffffff;">Timed Mock Exam</strong> to see where you stand.</li>
            <li style="margin-bottom: 8px;">Read <strong style="color: #ffffff;">Instant Explanations</strong> for every question.</li>
            <li style="margin-bottom: 8px;">Compete on the <strong style="color: #ffffff;">Global Leaderboard</strong>.</li>
            <li>Save tricky questions to your <strong style="color: #ffffff;">Bookmarks</strong>.</li>
        </ul>
    </div>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
        <tr>
            <td align="center">
                <a href="{FRONTEND_URL}/login" style="display: inline-block; background-color: #00d4ff; color: #002230; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);">Log In Now</a>
            </td>
        </tr>
    </table>
    """
    
    html_body = _build_email("Welcome Aboard! 🚀", content)
    _send_real_email(email, subject, html_body)

# 2. Password Reset Email
def send_password_reset_email(email, token):
    if not email: return
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    subject = "Reset Your Password - MAKAVERSE"
    
    content = f"""
    <p style="margin-top: 0;">Hello,</p>
    <p>We received a request to reset the password for your MAKAVERSE account. Click the button below to choose a new password.</p>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="{reset_link}" style="display: inline-block; background-color: #00d4ff; color: #002230; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 24px rgba(0, 212, 255, 0.3);">Reset My Password</a>
    </div>
    
    <p style="font-size: 14px; color: #5a7a92;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    """
    
    html_body = _build_email("Password Reset Request", content)
    _send_real_email(email, subject, html_body)

# 3. Support Request Email (Sent to Admin)
def send_support_email(student_name, student_email, message_text):
    if not SMTP_EMAIL: return
    subject = "New Support Request - MAKAVERSE"
    
    content = f"""
    <p style="margin-top: 0;">You have received a new support message from a student.</p>
    
    <div style="background-color: #101d31; border-left: 4px solid #00d4ff; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0 0 12px; color: #ffffff;"><strong>From:</strong> {student_name}</p>
        <p style="margin: 0 0 12px; color: #ffffff;"><strong>Email:</strong> {student_email}</p>
        <p style="margin: 0; color: #8ba8bd; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-top: 16px;">Message</p>
        <p style="margin: 8px 0 0; color: #ffffff; font-style: italic;">"{message_text}"</p>
    </div>
    
    <p>You can reply directly to the student's email address if they provided one.</p>
    """
    
    html_body = _build_email("New Support Request", content)
    _send_real_email(SMTP_EMAIL, subject, html_body)