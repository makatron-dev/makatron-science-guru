import os
import datetime
import threading
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY", "").strip()
_client_instance = None
_client_lock = threading.Lock()

# Fallback sequence: use the most stable one first, switch to backup if it fails
MODEL_SEQUENCE = ["gemini-3.6-flash", "gemini-3.8-flash"]
REQUEST_TIMEOUT_SECONDS = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "20"))


def _get_client():
    global _client_instance
    if _client_instance is not None:
        return _client_instance
    if not _api_key:
        return None
    with _client_lock:
        if _client_instance is not None:
            return _client_instance
        try:
            from google import genai
            _client_instance = genai.Client(api_key=_api_key)
            return _client_instance
        except Exception as e:
            print(f"[ai_service] Could not initialize Gemini client: {e}")
            return None


usage_tracker = {}
_usage_lock = threading.Lock()
DAILY_LIMIT = int(os.getenv("AI_DAILY_LIMIT", "5"))


def check_rate_limit(user_id: int) -> bool:
    today = str(datetime.date.today())
    with _usage_lock:
        entry = usage_tracker.get(user_id)
        if entry is None or entry.get("date") != today:
            usage_tracker[user_id] = {"date": today, "count": 0}
            entry = usage_tracker[user_id]
        if entry["count"] >= DAILY_LIMIT:
            return False
        entry["count"] += 1
        return True


FALLBACK_MESSAGE = (
    "Sorry, the AI Tutor is taking a short break. Please try again in a moment."
)


def get_ai_explanation(question_text: str, correct_answer: str) -> str:
    if not question_text or not correct_answer:
        return "I need a question and an answer to explain. Please try again."

    client = _get_client()
    if client is None:
        return FALLBACK_MESSAGE

    system_prompt = (
        "You are the MAKAVERSE AI Tutor, an expert science teacher. "
        "A student got a question wrong. Provide a direct, step-by-step breakdown.\n\n"
        "RULES:\n"
        "1. DO NOT start with greetings (e.g., 'Hello', 'Don't worry'). Start immediately with the explanation.\n"
        "2. Break down the logic clearly.\n"
        "3. Use plain text and line breaks. NO markdown code fences.\n"
        "4. Keep it under 150 words."
    )

    user_prompt = (
        f"Question: {question_text}\n"
        f"Correct Answer: {correct_answer}\n\n"
        "Explain why this answer is correct. Be direct and educational."
    )

    try:
        from google.genai import types as genai_types
    except Exception as e:
        print(f"[ai_service] google-genai types import failed: {e}")
        return FALLBACK_MESSAGE

    last_error = None
    for model_name in MODEL_SEQUENCE:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=genai_types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                    max_output_tokens=800,
                ),
            )
            
            text = getattr(response, "text", None)
            if text:
                print(f"[ai_service] Successfully used model: {model_name}")
                return text.strip()
            else:
                print(f"[ai_service] Model {model_name} returned empty text, trying next...")
                
        except Exception as e:
            last_error = e
            print(f"=== GEMINI API ERROR ({model_name}) ===")
            print(f"Type: {type(e).__name__}")
            print(f"Details: {str(e)}")
            print("========================")
            # Continue to next model if 503 or other server error
            continue

    # If all models failed
    print(f"[ai_service] All models failed. Last error: {last_error}")
    return FALLBACK_MESSAGE