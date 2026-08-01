from tracker import get_history
import os
import shutil
import tempfile
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
import json
# pyrefly: ignore [missing-import]
from fastapi import Request
import jwt

# Import existing application logic
from prompts import get_daily_prompt
from transcriber import transcribe_audio
from analyzer import calculate_pace, detect_fillers, detect_corrections
from feedback import generate_feedback
from ai_analyzer import detect_repetition_ai
from tracker import save_session, get_streak, delete_session, get_history

app = FastAPI(title="recraftt. Speech Analyzer API")

# Add CORS Middleware to allow browser requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static folder exists
os.makedirs("static", exist_ok=True)

@app.get("/api/prompt")
def api_get_prompt():
    """Retrieve today's speaking prompt."""
    try:
        prompt = get_daily_prompt()
        return {"prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def api_get_history(request: Request):
    user_id = get_current_user_id(request)
    try:
        streak = get_streak(user_id)
        history = get_history(user_id)
        return {"streak": streak, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{session_id}")
def api_delete_history(session_id: str, request: Request):
    user_id = get_current_user_id(request)  
    """Delete a specific session entry by index."""
    try:
        success = delete_session(session_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        streak = get_streak(user_id)
        history = get_history(user_id)
        return {
            "message": "Session deleted successfully",
            "streak": streak,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def api_analyze_audio(
    file: UploadFile = File(...),
    prompt: str = "Daily Practice"
):
    """Receive audio from browser, transcribe, analyze, and save session."""
    try:
        # Create a temporary file to save the uploaded audio
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
        if not suffix:
            suffix = ".webm"
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        try:
            # 1. Transcribe the audio file
            text, segments = transcribe_audio(temp_path)
            
            if not text.strip():
                return JSONResponse(
                    status_code=400,
                    content={"detail": "No speech detected. Please speak clearly into your mic."}
                )

            # 2. Run AI Repetition analysis
            ai_repetition_result = detect_repetition_ai(text)

            # 3. Standard speech metrics analysis
            pace, word_count, duration = calculate_pace(text, segments)
            filler_counts = detect_fillers(text)
            corrections = detect_corrections(text)

            # 4. Generate feedback
            feedback, mission = generate_feedback(pace, filler_counts, corrections)

            # 5. Save the session using existing tracker
            save_session(prompt, text, pace, filler_counts, corrections, ai_repetition_result, feedback, mission)
            
            # 6. Get updated streak
            streak = get_streak()

            return {
                "transcript": text,
                "pace": round(pace, 1),
                "duration": round(duration, 1),
                "word_count": word_count,
                "filler_counts": filler_counts,
                "corrections": corrections,
                "ai_repetition_analysis": ai_repetition_result,
                "feedback": feedback,
                "mission": mission,
                "streak": streak
            }
            
        finally:
            # Clean up the temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve index.html at root with no-cache headers so browsers/CDN never serve stale HTML.
# This must be declared BEFORE the StaticFiles mount.
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the main SPA page with cache-busting headers."""
    index_path = os.path.join(os.path.dirname(__file__), "static", "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(
        content=content,
        headers={
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )

# Mount static files (CSS, JS, assets). Serves everything under /static path.
app.mount("/", StaticFiles(directory="static", html=True), name="static")

def get_current_user_id(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload["sub"]  # "sub" is the user's unique ID inside the token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
