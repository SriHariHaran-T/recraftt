import json
import os
from datetime import datetime

HISTORY_FILE = "session_history.json"

def save_session(prompt, text, pace, filler_counts, corrections, ai_result, feedback, mission):
    session_record = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M:%S"),
        "prompt": prompt,
        "transcript": text,
        "pace": round(pace, 1),
        "filler_counts": filler_counts,
        "corrections": corrections,
        "ai_repetition_analysis": ai_result,
        "feedback": feedback,
        "mission": mission,
    }

    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
    else:
        history = []

    history.append(session_record)

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

    print(f"\nSession saved. You now have {len(history)} session(s) recorded.")


def get_streak():
    if not os.path.exists(HISTORY_FILE):
        return 0

    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)

    if not history:
        return 0

    dates = sorted(set(entry["date"] for entry in history), reverse=True)
    streak = 1
    today = datetime.now().date()

    if dates[0] != today.strftime("%Y-%m-%d"):
        return 0  # streak broken if no session today

    for i in range(1, len(dates)):
        prev_date = datetime.strptime(dates[i-1], "%Y-%m-%d").date()
        curr_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
        if (prev_date - curr_date).days == 1:
            streak += 1
        else:
            break

    return streak


def delete_session(index: int):
    if not os.path.exists(HISTORY_FILE):
        return False

    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)

    if 0 <= index < len(history):
        history.pop(index)
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f, indent=2)
        return True

    return False