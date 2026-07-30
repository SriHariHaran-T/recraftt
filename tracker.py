import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)
def save_session(user_id, prompt, text, pace, filler_counts, corrections, ai_result, feedback, mission):
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
    response = supabase.table("session").insert(data).execute()
    return response

def get_history(user_id):
    response = (
        supabase.table("session")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data

def get_streak(user_id):
    history = get_history(user_id)
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

def delete_session(session_id, user_id):
    response = (
        supabase.table("session")
        .delete()
        .eq("id", session_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(response.data) > 0