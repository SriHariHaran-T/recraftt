import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

def detect_repetition_ai(transcript):
    prompt = f"""You are an expert editor analyzing a recorded interview transcript.
    Your job is to identify and correct speaking errors ONLY.
    
    Rules:
    1. Find self-corrections, broken phrasing, restarts, and stutters.
    2. Fix ONLY the mistakes — keep the meaning, vocabulary, and tone exactly the same.
    3. DO NOT summarize, simplify, reword, improve grammar, add details, or change the style.
    4. Output the corrected text ONLY, without explanations or labels.

    Evaluate the user's communication in the following areas:
    - Clarity of ideas
    - Confidence
    - Organization and structure
    - Speaking flow
    - Repeated phrases or restarts
    - Overall communication effectiveness

Transcript:
\"\"\"{transcript}\"\"\"

For each instance you find, respond in this exact format:
Original: <what they said>
Suggestion: <a clearer, more confident way to say the same thing in one smooth sentence>

If none are found, respond with exactly: "None detected."
Keep your response concise — no extra explanation, no preamble."""

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