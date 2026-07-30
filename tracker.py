import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
from supabase import create_client, ClientOptions

load_dotenv()

def get_client(token: str = None):
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if token:
        return create_client(url, key, options=ClientOptions(headers={'Authorization': f'Bearer {token}'}))
    return create_client(url, key)
def save_session(user_id, prompt, text, pace, filler_counts, corrections, ai_result, feedback, mission, token=None):
    data = {
        "user_id": user_id,
        "prompt": prompt,
        "transcript": text,
        "pace": pace,
        "filler_counts": filler_counts,
        "corrections": corrections,
        "ai_repetition_analysis": ai_result,
        "feedback": feedback,
        "mission": mission,
    }
    client = get_client(token)
    response = client.table("session").insert(data).execute()
    return response

def get_history(user_id, token=None):
    client = get_client(token)
    response = (
        client.table("session")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data

def get_streak(user_id, token=None):
    history = get_history(user_id, token)
    if not history:
        return 0

    from datetime import datetime
    dates = sorted(set(entry["created_at"][:10] for entry in history), reverse=True)
    streak = 1
    today = datetime.now().date()

    if dates[0] != today.strftime("%Y-%m-%d"):
        return 0

    for i in range(1, len(dates)):
        prev_date = datetime.strptime(dates[i-1], "%Y-%m-%d").date()
        curr_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
        if (prev_date - curr_date).days == 1:
            streak += 1
        else:
            break

    return streak

def delete_session(session_id, user_id, token=None):
    client = get_client(token)
    response = (
        client.table("session")
        .delete()
        .eq("id", session_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(response.data) > 0