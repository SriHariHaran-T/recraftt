import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json

# Import existing application logic
from prompts import get_daily_prompt
from transcriber import transcribe_audio
from analyzer import calculate_pace, detect_fillers, detect_corrections
from feedback import generate_feedback
from ai_analyzer import detect_repetition_ai
from tracker import save_session, get_streak, delete_session, HISTORY_FILE

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
def api_get_history():
    """Retrieve speech analysis history and current streak."""
    try:
        streak = get_streak()
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
        return {
            "streak": streak,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{index}")
def api_delete_history(index: int):
    """Delete a specific session entry by index."""
    try:
        success = delete_session(index)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        streak = get_streak()
        history = []
        if os.path.exists(HISTORY_FILE):
            with open(HISTORY_FILE, "r") as f:
                history = json.load(f)
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

# Mount static files. Note: Serve index.html as root.
app.mount("/", StaticFiles(directory="static", html=True), name="static")
