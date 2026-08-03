# recraftt.

> **AI-powered speech practice & analysis dashboard — built to help you speak with more clarity, confidence, and control.**

recraftt. records your voice, transcribes it in the cloud, and delivers instant, actionable feedback on your speaking habits — from pace and filler words to AI-powered rephrasing suggestions.

---

## ✨ Features at a Glance

### 🎤 In-Browser Voice Recorder
- One-click recording directly from your browser no plugins required!
- Live **animated waveform canvas** visualises your audio in real-time
- On-screen **countdown timer** tracks the length of each session
- Recordings are sent securely to the backend as `.webm` audio blobs

<img width="1894" height="974" alt="image" src="https://github.com/user-attachments/assets/e9d932fd-8038-45dc-83cd-9d308d3ddb7d" />

### 📝 AI Transcription via Whisper
- Audio is transcribed using **Whisper Base** model for fast, accurate speech-to-text
- Returns word-level segments used to compute precise timing metrics
- Gracefully handles silence alerts you if no speech is detected

<img width="524" height="457" alt="image" src="https://github.com/user-attachments/assets/bc5cccc2-1409-4cf1-8847-4aa056c9a3fc" />


### 📊 Speech Metrics Dashboard
After every session, you get an instant breakdown:

<img width="552" height="734" alt="image" src="https://github.com/user-attachments/assets/7307e280-e0fe-43df-a76b-dd9049eb5089" />


| Metric | What It Measures |
|---|---|
| **Speaking Pace** | Words per minute (WPM) with a visual slow / balanced / fast gauge |
| **Duration** | Total speaking time in seconds |
| **Word Count** | Total words spoken in the session |

### 🚦 Filler Word Detection
- Detects 13 common fillers: `um`, `uh`, `like`, `you know`, `so`, `actually`, `basically`, `literally`, `right`, `okay`, `well`, `mm`, `hmm`
- Displays each filler with its count as a **visual tag cloud**
- Integrated into feedback the most-used filler becomes tomorrow's focus!

### ✂️ Self-Correction Detection
- Automatically flags self-correction phrases: *"I meant"*, *"let me rephrase"*, *"what I meant was"*, *"sorry"*, and more
- Shows the list of detected corrections so you can see exactly where you stumbled

### 🤖 AI Rephrasing Suggestions (Llama 3.3 70B)
- Powered by **Groq's Llama-3.3-70b-versatile** model via the OpenAI-compatible API
- Identifies broken phrasing, restarts, and stutters in your transcript
- For each issue found, provides:
  - **Original** - what you actually said
  - **Suggestion** - a cleaner, more confident way to say the same thing
- Evaluates: clarity of ideas, confidence, organisation, speaking flow, and overall effectiveness

### 🏆 Daily Speaking Prompts
- 30+ curated speaking prompts covering personal stories, professional topics, and creative questions
- **Refresh button** fetches a new prompt at any time
- Prompts serve as realistic practice scenarios, not just exercises

### 📈 Personalised Feedback & Mission
- **Key Takeaways** - 2–3 targeted observations about pace, fillers, and corrections
- **Mission for Tomorrow** - a single, specific improvement goal tailored to your biggest weak point that session:
  - Too many fillers? → Focus on replacing `"um"` with a silent pause
  - Too fast? → Slow down at key points
  - Self-corrections? → Pause before starting sentences

### 🔥 Streak Tracker
- Tracks consecutive days you have practised
- Live **streak badge** in the header keeps you accountable
- Resets to zero if you skip a day - keep the streak alive!

### 📂 Session History
- Every session is auto-saved to Supabase database
- The **Session History** panel shows all past sessions: date, prompt, pace, and feedback
- Individual sessions can be **deleted** from the UI

<img width="1214" height="243" alt="image" src="https://github.com/user-attachments/assets/6e9f67d8-1d9b-4770-9aae-17251d36f7e8" />


---

## 🏗️ Architecture

```
recraftt/
├── app.py              # FastAPI backend — REST API routes
├── transcriber.py      # Whisper transcription
├── analyzer.py         # Pace, filler word & correction detection
├── ai_analyzer.py      # Groq Llama AI rephrasing suggestions
├── feedback.py         # Rule-based feedback & mission generator
├── prompts.py          # Daily speaking prompt bank (30+ prompts)
├── tracker.py          # Session persistence & streak calculation
├── static/
│   ├── index.html      # Single-page application shell
│   ├── style.css       # Premium glassmorphism design system
│   └── app.js          # Frontend logic — recorder, API calls, UI
└── requirements.txt    # Python dependencies
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python · FastAPI · Uvicorn |
| **AI / STT** | Whisper Large v3 (transcription) |
| **AI / NLP** | Groq API - Llama 3.3 70B (rephrasing analysis) |
| **Frontend** | Vanilla HTML · CSS · JavaScript |
| **Design** | Glassmorphism · Playfair Display · Canvas API |
| **Storage** | Supabase database |

---

## 🗺️ Roadmap

- [✔] User authentication & cloud sync
- [ ] Progress charts over time (pace trends, filler word reduction)
- [ ] Custom prompt categories (job interviews, public speaking, storytelling)
- [ ] Pronunciation scoring

---

## 🗿 Thanks To

- Huge shoutout to my friend Anbu Chelvan for mentoring me on this project! He’s an aspiring game dev go check out his awesome work!- https://www.instagram.com/rozex.studios/

---
## 🌐 Check Out The Website

- https://recraftt.onrender.com/

---

## 📄 License

This project is a prototype. Licensing TBD.

---

<p align="center">Built with love to help people speak better, one session at a time.</p>
<p align="center"> A project by Sri Hari Haran. </p>
