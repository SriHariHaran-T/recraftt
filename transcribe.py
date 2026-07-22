import whisper

model = whisper.load_model("base")
result = model.transcribe("t_audio.mp3")

print("Transcript:")
print(result["text"])

#Speaking Pace Calculation
word_count = len(result["text"].split())
total_duration = result["segments"][-1]["end"]
duration_minutes = total_duration / 60
speaking_pace = word_count / duration_minutes

print(f"\nWord count: {word_count}")
print(f"Duration: {total_duration:.1f} seconds")
print(f"Speaking pace: {speaking_pace:.1f} words per minute")

# --- Filler word detection ---
filler_words = ["um", "uh", "mm" , "hmm" , "like", "you know", "so", "actually", "basically", "literally", "right", "okay", "well"]

lower_text = result["text"].lower()
filler_counts = {}

for filler in filler_words:
    count = lower_text.count(filler)
    if count > 0:
        filler_counts[filler] = count

print(f"\nFiller words detected: {filler_counts}")

# --- Feedback Generation ---

feedback = []

# Pace feedback
if speaking_pace < 110:
    feedback.append("Your pace was a bit slow today — try adding a touch more energy to keep your listener engaged.")
elif speaking_pace > 160:
    feedback.append("You spoke quite fast — slowing down slightly could help your ideas land more clearly.")
else:
    feedback.append("Your speaking pace was well-balanced and easy to follow.")

# Filler word feedback
total_fillers = sum(filler_counts.values())
if total_fillers == 0:
    feedback.append("Great job — no filler words detected in this session.")
elif total_fillers <= 2:
    feedback.append(f"You used {total_fillers} filler word(s). That's pretty minimal — nice control.")
else:
    most_common_filler = max(filler_counts, key=filler_counts.get)
    feedback.append(f"You used {total_fillers} filler words, most often '{most_common_filler}'. Try pausing silently instead of filling gaps with words.")

# --- Mission Generation ---

if total_fillers > 2:
    mission = f"Tomorrow, focus on replacing '{most_common_filler}' with a brief pause instead."
elif speaking_pace > 160:
    mission = "Tomorrow, consciously slow down during your key points."
elif speaking_pace < 110:
    mission = "Tomorrow, try to speak with a bit more energy and pacing variation."
else:
    mission = "Tomorrow, try extending your response by 10-15 seconds while keeping this same clarity."

# --- Print the report ---

print("\n--- Your Communication Report ---")
for point in feedback:
    print(f"- {point}")

print(f"\nMission for tomorrow: {mission}")