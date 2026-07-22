import sounddevice as sd
from scipy.io.wavfile import write
import time

duration = 15  # seconds
sample_rate = 44100

# --- Countdown before recording ---
print("Get ready to speak...")
for i in range(3, 0, -1):
    print(i)
    time.sleep(1)

print("Recording... speak now!")

# --- Start recording ---
recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)

# --- Live countdown while recording ---
for remaining in range(duration, 0, -1):
    print(f"{remaining} seconds left...", end="\r")
    time.sleep(1)

sd.wait()  # ensures recording is fully finished

write("t_audio.wav", sample_rate, recording)
print("\nDone! Saved as t_audio.wav")