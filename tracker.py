import os
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "recraftt.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            prompt TEXT,
            transcript TEXT,
            pace REAL,
            filler_counts TEXT,
            corrections TEXT,
            ai_repetition_analysis TEXT,
            feedback TEXT,
            mission TEXT,
            duration REAL,
            total_words INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            display_name TEXT
        )
    """)
    cursor.execute("""
        INSERT OR IGNORE INTO user_profile (user_id, display_name)
        VALUES ('local_user', 'Local User')
    """)
    conn.commit()
    conn.close()


init_db()

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def save_session(user_id, prompt, text, pace, filler_counts, corrections, ai_result, feedback, mission, token=None, duration=None, total_words=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO session (
            user_id, prompt, transcript, pace, filler_counts, corrections, 
            ai_repetition_analysis, feedback, mission, duration, total_words
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id, prompt, text, pace, json.dumps(filler_counts), json.dumps(corrections),
        ai_result, json.dumps(feedback), mission, duration, total_words
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return {"data": [{"id": inserted_id}]}

def get_history(user_id, token=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM session 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        row_dict = dict(row)
        if row_dict['filler_counts']:
            row_dict['filler_counts'] = json.loads(row_dict['filler_counts'])
        if row_dict['corrections']:
            row_dict['corrections'] = json.loads(row_dict['corrections'])
        if row_dict['feedback']:
            row_dict['feedback'] = json.loads(row_dict['feedback'])
        history.append(row_dict)
    return history

def get_streak(user_id, token=None):
    history = get_history(user_id, token)
    if not history:
        return 0

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
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM session WHERE id = ? AND user_id = ?', (session_id, user_id))
    rows_deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_deleted > 0

def get_profile(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT display_name FROM user_profile WHERE user_id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"display_name": row["display_name"]}
    return {"display_name": "Local User"}

def update_profile(user_id, display_name):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_profile (user_id, display_name)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET display_name = excluded.display_name
    """, (user_id, display_name))
    conn.commit()
    conn.close()
    return {"display_name": display_name}
