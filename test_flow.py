import os
os.environ["GROQ_API_KEY"] = "test_key"
import json
from fastapi.testclient import TestClient
from app import app
import tracker
import app as main_app

# Mock transcriber so we don't need real audio
def mock_transcribe(filepath):
    # Dummy segments format expected by analyzer.py calculate_pace
    segments = [{"start": 0.0, "end": 5.5, "text": "This is a test recording to check duration and words."}]
    return "This is a test recording to check duration and words.", segments

main_app.transcribe_audio = mock_transcribe

# Mock AI so we don't hit rate limits or wait during test
import ai_analyzer
main_app.detect_repetition_ai = lambda text: "Original: a\nSuggestion: b"
main_app.check_relevance = lambda p, t: "Relevant: Yes\nReason: test"

client = TestClient(app)

# No auth headers needed for local app
headers = {}

print("--- Starting Flow Test ---")

# Create dummy file
with open("dummy.webm", "wb") as f:
    f.write(b"dummy")

try:
    with open("dummy.webm", "rb") as f:
        res = client.post("/api/analyze-audio", headers=headers, data={"prompt": "Test Prompt"}, files={"file": ("dummy.webm", f, "audio/webm")})
    
    print(f"Live Analysis Status: {res.status_code}")
    live_data = res.json()
    if res.status_code == 500:
        print(f"Error detail: {live_data}")
    print("--- 3. Verify live report ---")
    print(f"Live Duration: {live_data.get('duration')}")
    print(f"Live Total Words: {live_data.get('total_words')}")
    
    print("--- 4, 5, 6. Verify Session History DB & API ---")
    hist_res = client.get("/api/history", headers=headers)
    hist_data = hist_res.json()
    sessions = hist_data.get("history", [])
    
    if not sessions:
        print("ERROR: No sessions found in history.")
    else:
        latest = sessions[0]
        print(f"DB Duration: {latest.get('duration')}")
        print(f"DB Total Words: {latest.get('total_words')}")
        
        # Cleanup
        tracker.delete_session(latest['id'], "test_user_duration_flow")
        print("Test session cleaned up successfully.")
        
except Exception as e:
    print(f"Test failed with error: {e}")
finally:
    if os.path.exists("dummy.webm"):
        os.remove("dummy.webm")
