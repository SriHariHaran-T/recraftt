import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def detect_repetition_ai(transcript):
    prompt = f"""You are analyzing a spoken transcript for self-corrections, broken english or repeated ideas
where the speaker restarted or rephrased a thought mid-response.

Transcript:
\"\"\"{transcript}\"\"\"

For each instance you find, respond in this exact format:
Original: <what they said>
Suggestion: <a clearer, more confident way to say the same thing in one smooth sentence>

If none are found, respond with exactly: "None detected."
Keep your response concise — no extra explanation, no preamble."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content