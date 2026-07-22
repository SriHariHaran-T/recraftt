# --- Today's Prompt ---

from difflib import SequenceMatcher
import random

prompts = [
    "Tell me about a challenge you recently overcame.",
    "Describe your ideal weekend and why you'd enjoy it.",
    "Talk about a skill you're currently trying to improve.",
    "Describe a person who has influenced you and how.",
    "Explain a topic you're passionate about to someone new to it.",
    "Talk about a mistake you learned something valuable from.",
    "Describe your morning routine and how it sets up your day.",
    "Talk about a goal you're working towards this year.",
]

today_prompt = random.choice(prompts)

print("Today's prompt:")
print(today_prompt)
print()

# --- Session Code ---

import sounddevice as sd
from scipy.io.wavfile import write
import time
import whisper

# --- Settings ---
duration = 15
sample_rate = 44100
filename = "test_audio.wav"

# --- Record ---
print("Get ready to speak...")
for i in range(5, 0, -1):
    print(i)
    time.sleep(1)

print("Recording... speak now!")
recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)

for remaining in range(duration, 0, -1):
    print(f"{remaining} seconds left...", end="\r")
    time.sleep(1)

sd.wait()
write(filename, sample_rate, recording)
print("\nRecording saved. Transcribing...\n")

# --- Transcribe ---
model = whisper.load_model("base")
result = model.transcribe(filename)

full_text = result["text"]
segments = result["segments"]

print("Transcript:")
print(full_text)

# --- Speaking pace ---
word_count = len(full_text.split())
total_duration = segments[-1]["end"]
duration_minutes = total_duration / 60
speaking_pace = word_count / duration_minutes

print(f"\nWord count: {word_count}")
print(f"Duration: {total_duration:.1f} seconds")
print(f"Speaking pace: {speaking_pace:.1f} words per minute")

# --- Filler words ---
filler_words = ["um", "uh", "mm", "hmm", "like", "you know", "so", "actually", "basically", "literally", "right", "okay", "well"]
lower_text = full_text.lower()
filler_counts = {}

for filler in filler_words:
    count = lower_text.count(filler)
    if count > 0:
        filler_counts[filler] = count

print(f"\nFiller words detected: {filler_counts}")

# --- Repetition Detection (phrase-level) ---
words = full_text.split()
window_size = 4  # check 4-word chunks
repeated_phrases = []

for i in range(len(words) - window_size * 2):
    phrase1 = " ".join(words[i:i+window_size]).lower()
    phrase2 = " ".join(words[i+window_size:i+window_size*2]).lower()
    similarity = SequenceMatcher(None, phrase1, phrase2).ratio()
    if similarity > 0.7:
        repeated_phrases.append((phrase1, phrase2))

print(f"\nRepeated/restarted phrases detected: {len(repeated_phrases)}")
for pair in repeated_phrases:
    print(f"  - \"{pair[0]}\" → \"{pair[1]}\"")

# --- Feedback ---
feedback = []

if speaking_pace < 110:
    feedback.append("Your pace was a bit slow today — try adding a touch more energy to keep your listener engaged.")
elif speaking_pace > 160:
    feedback.append("You spoke quite fast — slowing down slightly could help your ideas land more clearly.")
else:
    feedback.append("Your speaking pace was well-balanced and easy to follow.")

total_fillers = sum(filler_counts.values())
if total_fillers == 0:
    feedback.append("Great job — no filler words detected in this session.")
elif total_fillers <= 2:
    feedback.append(f"You used {total_fillers} filler word(s). That's pretty minimal — nice control.")
else:
    most_common_filler = max(filler_counts, key=filler_counts.get)
    feedback.append(f"You used {total_fillers} filler words, most often '{most_common_filler}'. Try pausing silently instead of filling gaps with words.")

if total_fillers > 2:
    mission = f"Tomorrow, focus on replacing '{most_common_filler}' with a brief pause instead."
elif speaking_pace > 160:
    mission = "Tomorrow, consciously slow down during your key points."
elif speaking_pace < 110:
    mission = "Tomorrow, try to speak with a bit more energy and pacing variation."
else:
    mission = "Tomorrow, try extending your response by 10-15 seconds while keeping this same clarity."

print("\n--- Your Communication Report ---")
for point in feedback:
    print(f"- {point}")

print(f"\nMission for tomorrow: {mission}")