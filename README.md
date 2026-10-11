# recraftt.

**AI-powered speech practice and communication analysis.**

recraftt. is a speech practice application designed to help students understand and improve their spoken communication. It records speech, transcribes audio, analyses speaking patterns, and provides feedback that learners can use in their next practice session.

The goal is simple: help people understand how they speak and identify specific areas they can work on.

## Features

### Voice Recording and Transcription

- Record speech directly in the browser.
- Transcribe recorded audio using Whisper through the Groq API.
- Handle recordings where no speech is detected.
- Measure speaking duration and total word count.

### Speech Analysis

- Calculate speaking pace in words per minute.
- Detect common filler words and count their occurrences.
- Identify common self-correction phrases.
- Analyse repeated speech patterns.

These measurements are intended to help learners recognise habits in their spoken responses. They are not a complete assessment of communication ability.

### AI-Assisted Feedback

- Generate alternative versions of spoken responses while aiming to preserve their original meaning.
- Check whether a response is relevant to its assigned speaking prompt.
- Provide feedback based on detected speaking patterns.
- Suggest practice activities for identified areas of improvement.

AI-generated feedback can be inaccurate, so suggestions should be treated as guidance rather than definitive evaluations.

### Session History and Progress

- Save completed practice sessions to a local SQLite database.
- Review previous sessions.
- Track practice streaks.
- View speaking metrics and feedback from earlier sessions.
- Generate an adaptive profile using available session data.

Progress estimates depend on the available session history and the application's scoring logic. They should not be interpreted as scientifically validated communication scores.

### Local User Profile

- Edit the display name shown in the dashboard.
- Generate the profile avatar from the first letter of the display name.
- Retain the display name between page refreshes and server restarts.

The current application is designed for local use. It does not currently provide a complete account system or separate authenticated profiles for multiple users.

## How It Works

1. The user receives a speaking prompt.
2. They record their response in the browser.
3. The browser sends the audio to the Python backend.
4. The backend uses the Groq API for speech transcription.
5. The application calculates speaking metrics and identifies speech patterns.
6. AI services generate response suggestions and prompt relevance feedback.
7. Session information is stored in a local SQLite database.
8. The application uses saved sessions to display history and estimate progress.

## Tech Stack

| Component | Technology |
| --- | --- |
| Backend | Python, FastAPI, Uvicorn |
| Frontend | HTML, CSS, JavaScript |
| Speech-to-Text | Whisper through the Groq API |
| Language Model | GPT-OSS 120B through the Groq API |
| Database | SQLite |
| AI API Integration | OpenAI-compatible Python client |

## Project Structure

| File or directory | Purpose |
| --- | --- |
| `app.py` | FastAPI application and API endpoints |
| `tracker.py` | SQLite database operations and session history |
| `transcriber.py` | Speech transcription through Groq |
| `analyzer.py` | Speaking pace, filler words, and self-correction detection |
| `ai_analyzer.py` | AI-assisted response rewriting and relevance checks |
| `feedback.py` | Feedback generation and practice missions |
| `adaptive_engine.py` | Progress estimates and exercise recommendations |
| `prompts.py` | Speaking prompt selection |
| `main.py` | Command-line application entry point |
| `static/` | Browser interface, styles, and JavaScript |
| `test_flow.py` | Tests for the practice and analysis flow |
| `test_profile.py` | Tests for profile functionality |
| `data/` | Local database storage, generated when the application runs |

## Getting Started

### Prerequisites

- Python
- Git
- A Groq API key
- An internet connection for Groq API requests

### 1. Clone the repository

```bash
git clone https://github.com/SriHariHaran-T/recraftt.git
cd recraftt
```

### 2. Create a virtual environment

On Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

On Linux or macOS:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the environment

Create a `.env` file in the project root using `.env.example` as a template.

```env
GROQ_API_KEY=your_groq_api_key
```

Replace the placeholder with your own Groq API key.

**Never commit your `.env` file or publish your API key.**

### 5. Start the application

```bash
python -m uvicorn app:app --reload --port 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

The application creates its local SQLite database when required. The Groq API still requires an internet connection for transcription and AI-powered features.

## Storage and Privacy

Practice sessions and the local display profile are stored in SQLite on the machine running the application.

Audio is sent to the Groq API for transcription and may be processed by AI services as part of the analysis workflow. Do not assume that audio or transcripts remain exclusively on your machine.

The current version does not include a production-ready multi-user account system, remote synchronisation, or deployment-grade authentication.

## Development

I came up with the idea for recraftt. and used Google Antigravity to implement the project, including its frontend, backend, and SQLite migration. I guided the development through my ideas and requirements, then tested the application and worked through issues as they came up.

Building this project has given me practical experience with Python backend development, API integration, speech processing, database operations, frontend and backend communication, and debugging an application across multiple components.

## Roadmap

Potential future improvements include:

- More robust speech pattern detection.
- Better testing and error handling.
- More detailed progress visualisation.
- Additional practice prompts and exercises.
- Improved accessibility and user experience.
- A proper account system if multi-user support is introduced.

These are potential improvements, not claims about features already implemented.

## License

No license has been specified for this project yet. Until a license is added, do not assume that the code is available for unrestricted reuse or redistribution.
