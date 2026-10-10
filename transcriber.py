import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY", "dummy_key_to_allow_startup"),
    base_url="https://api.groq.com/openai/v1"
)

def transcribe_audio(filepath):
    """Transcribe audio file using Groq's cloud Whisper API."""
    with open(filepath, "rb") as file:
        response = client.audio.transcriptions.create(
            file=(os.path.basename(filepath), file.read()),
            model="whisper-large-v3",
            response_format="verbose_json"
        )
    return response.text, response.segments