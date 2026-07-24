from prompts import get_daily_prompt
from recorder import record_audio
from transcriber import transcribe_audio
from analyzer import calculate_pace, detect_fillers, detect_corrections
from feedback import generate_feedback

# --- Daily prompt ---
prompt = get_daily_prompt()
print("Today's prompt:")
print(prompt)
print()

# --- Record ---
audio_file = record_audio()

# --- Transcribe ---
print("\nTranscribing...\n")
text, segments = transcribe_audio(audio_file)
print("Transcript:")
print(text)
text, segments = transcribe_audio(audio_file)
if not text.strip():
    print("\nNo speech detected — please try recording again and make sure you're speaking clearly into your microphone.")
    exit()

from ai_analyzer import detect_repetition_ai

# ... after transcription ...

ai_repetition_result = detect_repetition_ai(text)
print(f"\nAI Repetition Analysis:\n{ai_repetition_result}")

# --- Analyze ---
pace, word_count, duration = calculate_pace(text, segments)
filler_counts = detect_fillers(text)
corrections = detect_corrections(text)

print(f"\nWord count: {word_count}")
print(f"Duration: {duration:.1f} seconds")
print(f"Speaking pace: {pace:.1f} words per minute")
print(f"Filler words detected: {filler_counts}")
print(f"Self-corrections detected: {corrections}")

# --- Feedback ---
feedback, mission = generate_feedback(pace, filler_counts, corrections)

print("\n--- Your Communication Report ---")
for point in feedback:
    print(f"- {point}")

print(f"\nMission for tomorrow: {mission}")

from tracker import save_session, get_streak

# ... after generating feedback and mission ...

save_session(prompt, text, pace, filler_counts, corrections, ai_repetition_result, feedback, mission)

streak = get_streak()
print(f"Current streak: {streak} day(s)")