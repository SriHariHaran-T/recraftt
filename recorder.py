import sounddevice as sd
from scipy.io.wavfile import write
import time

def record_audio(filename="test_audio.wav", duration=15, sample_rate=44100):
    print("Get ready to speak...")
    for i in range(3, 0, -1):
        print(i)
        time.sleep(1)

    print("Recording... speak now!")
    recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)

    for remaining in range(duration, 0, -1):
        print(f"{remaining} seconds left...", end="\r")
        time.sleep(1)

    sd.wait()
    write(filename, sample_rate, recording)
    print("\nRecording saved.")
    return filename