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

def detect_repetition_ai(transcript):
    prompt = f"""You are an expert communication coach analyzing a spoken transcript.
Your goal is to reconstruct the user's complete message into a natural, concise, and confident version.

Rules:
1. Remove filler words ("um", "uh", "like", "you know").
2. Remove false starts and abandoned phrases.
3. Fix grammar and awkward sentence structure.
4. Improve word choice when appropriate.
5. Reconstruct fragmented thoughts into natural sentences.
6. Preserve the user's ORIGINAL INTENDED MEANING completely.
7. Do NOT add information that the user did not communicate.
8. Do NOT change facts, people, locations, times, events, opinions or intentions.
9. Make the result sound like something a confident, natural speaker would actually say in spoken English (avoid excessively formal or academic language).
10. Be concise where possible without losing meaning.

If the original transcript is already clear, natural, and confident, return a minimally edited version.
If the transcript lacks any meaningful content to rewrite, set "better_way" to null.

Transcript:
\"\"\"{transcript}\"\"\"

Respond ONLY with a valid JSON object in the exact following format, with no markdown formatting or extra text:
{{
    "original": "<complete original transcript>",
    "better_way": "<complete reconstructed response or null>"
}}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content

def check_relevance(prompt, transcript):
    relevance_prompt = f"""You are evaluating whether a spoken response actually addresses the given prompt.

Prompt: "{prompt}"

Response transcript:
\"\"\"{transcript}\"\"\"

Respond in this exact format:
Relevant: <Yes or No>
Reason: <one short sentence explaining why>

Be lenient with loose or creative interpretations — only mark "No" if the response clearly does not engage with the prompt's topic at all."""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": relevance_prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content

def is_relevant(relevance_result):
    first_line = relevance_result.strip().split("\n")[0].lower()
    return "yes" in first_line