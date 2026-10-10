# recraftt.

**AI-powered speech practice and communication analysis.**

recraftt. helps students improve their spoken communication through voice recording, speech analysis, personalised feedback, and repeated practice.

It analyses speaking patterns, identifies potential areas for improvement, and turns each session into actionable suggestions for the next one.

## Features

### Voice Recording & Transcription
- Record speech directly in the browser.
- Transcribe audio using Whisper through the Groq API.
- Handle recordings with no detected speech.

### Speech Analysis
- Calculate speaking pace in words per minute.
- Detect common filler words and count their occurrences.
- Identify common self-correction phrases.
- Measure speaking duration and word count.

### AI-Powered Feedback
- Generate clearer alternative versions of spoken responses while aiming to preserve their original meaning.
- Check whether responses are relevant to the assigned prompt.
- Provide feedback and practice suggestions based on detected speaking patterns.

### Progress Tracking
- Save and retrieve previous practice sessions.
- Track consecutive practice days.
- Build a communication profile from recent sessions.
- Estimate performance trends across sessions.
- Recommend exercises based on identified weaknesses.

## How It Works

1. The learner receives a speaking prompt.
2. They record their response in the browser.
3. The audio is sent to the Python backend.
4. Whisper transcribes the recording.
5. The backend calculates speech metrics and identifies patterns.
6. AI services analyse the response and generate feedback.
7. Session data is saved to Supabase.
8. Previous sessions inform progress tracking and practice recommendations.

## Tech Stack

| Component | Technology |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| Frontend | HTML, CSS, JavaScript |
| Speech-to-Text | Whisper through the Groq API |
| Language Model | GPT-OSS 120B through the Groq API |
| Database | Supabase |
| API Integration | OpenAI-compatible Python client |

## Architecture

The backend is organised into modules with separate responsibilities.

| Module | Responsibility |
| --- | --- |
| `app.py` | FastAPI application and API routes |
| `transcriber.py` | Audio transcription |
| `analyzer.py` | Speaking pace, filler words, and self-correction detection |
| `ai_analyzer.py` | AI-assisted response rewriting and prompt relevance checks |
| `feedback.py` | Feedback messages and practice missions |
| `adaptive_engine.py` | Scores, progress trends, and exercise recommendations |
| `tracker.py` | Session history and practice streaks |
| `prompts.py` | Speaking prompt selection |

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Git
- A Groq API key
- A Supabase project with the required database configuration

### 1. Clone the repository

```bash
git clone https://github.com/SriHariHaran-T/recraftt.git
cd recraftt
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Activate it on Linux or macOS:

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual credentials.

- `GROQ_API_KEY` is used to access Groq's transcription and language-model APIs.
- `SUPABASE_URL` identifies your Supabase project.
- `SUPABASE_ANON_KEY` is used by the backend to connect to Supabase.

**Never commit your `.env` file or expose your API keys and tokens publicly.** Configure appropriate Supabase access policies and secure authentication before deploying the application.

### 5. Start the server

```bash
uvicorn app:app --reload
```

Open `http://127.0.0.1:8000` in your browser.

Local setup may require additional configuration for Supabase authentication, database tables, and frontend integration.

## Project Goals

recraftt. is built around a simple idea: speaking practice should help learners understand what to improve, not just show them a transcript.

The intended learning cycle is:

**Assess → Understand → Practise → Reassess → Improve**

The long-term goal is to make practice more responsive to each learner's communication patterns and progress over time.

## Development

recraftt. is a personal project developed through a combination of my own work and AI-assisted development.

I developed the Python backend and used Google Antigravity to make with the HTML, CSS, and JavaScript frontend.

Working on this project has given me practical experience with Python backend development, API integration, speech processing, database-backed applications, and AI services.

## Roadmap

Potential future improvements include:

- More robust speech and fluency analysis.
- More varied personalised practice exercises.
- Improved progress visualisation.
- Better testing and error handling.
- Expanded documentation.

## Contributing

Suggestions, bug reports, and constructive feedback are welcome.

## License

No license has been specified yet. Please check the repository for licensing information before reusing or distributing the code.
