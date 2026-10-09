# recraftt.

> **AI-powered adaptive speech practice & analysis dashboard — built to help students speak with more clarity, confidence, and control.**

recraftt. records your voice, transcribes it, analyses your communication patterns, and turns your performance into personalised feedback and targeted practice.

Instead of giving every learner the same practice, recraftt. builds an understanding of individual communication strengths and weaknesses across repeated sessions.

---

## 👀 Features at a Glance

### 🎤 In-Browser Voice Recorder
- One-click recording directly from your browser — no plugins required!
- Live recording interface with an animated waveform
- On-screen countdown timer tracks session duration
- Recordings are sent securely to the backend as `.webm` audio blobs

### 📝 AI Transcription via Whisper
- Recorded speech is transcribed using Whisper
- Produces a text transcript for communication analysis
- Handles silent recordings gracefully and alerts the learner when no speech is detected

### 📊 Speech Metrics Dashboard

After every speaking session, recraftt. provides an instant breakdown:

| Metric | What It Measures |
|---|---|
| **Speaking Pace** | Words per minute (WPM) with a slow / balanced / fast indicator |
| **Duration** | Total speaking time in seconds |
| **Word Count** | Total words spoken during the session |

### 🚦 Filler Word Detection
- Detects common filler words such as:
  `um`, `uh`, `like`, `you know`, `so`, `actually`, `basically`, `literally`, `right`, `okay`, `well`, `mm`, `hmm`
- Displays detected fillers and their counts
- Filler usage contributes to the learner's communication profile
- The system can identify filler words as a primary area for improvement

### ✂️ Self-Correction & Broken-Phrasing Detection
- Detects self-corrections and broken sentence structures
- Identifies patterns such as:
  - `"I meant..."`
  - `"let me rephrase..."`
  - `"what I meant was..."`
  - `"sorry..."`
- Uses these signals to evaluate speaking fluency and communication control

### 🤖 AI Communication Analysis

recraftt. uses an AI analysis layer to evaluate the learner's complete spoken response.

The current AI analysis uses the configured `gpt-oss-120b` model through the Groq API.

The system evaluates communication aspects such as:

- Clarity
- Confidence
- Organisation
- Speaking flow
- Sentence construction
- Overall communication effectiveness

### ✨ A Better Way to Say It

Instead of correcting individual phrases separately, recraftt. reconstructs the learner's **complete spoken response** into a clearer and more natural version.

The goal is to preserve the learner's original meaning while removing:

- Hesitation
- Broken phrasing
- Unnecessary repetition
- Awkward sentence construction
- Stutters and restarts

#### Example

**You said:**

> "I have to get to um there I think to my colleague meeting at 7 pm."

**A clearer way to say it:**

> "I have to meet my colleague at their place at 7 pm."

The system does not intentionally change the speaker's facts, people, locations, times, opinions, or intended meaning.

### 🧠 Communication Profile

recraftt. builds a communication profile from repeated speaking sessions.

The profile currently tracks:

- **Pace Score**
- **Filler Control**
- **Fluency / Self-Correction Score**
- **Communication Trend**
- **Primary Weakness**
- **Today's Recommendation**

The profile uses recent sessions to provide a more meaningful picture of the learner's communication habits instead of relying only on a single recording.

### 🎯 Personalised Feedback & Missions

After each session, recraftt. provides targeted coaching based on the learner's performance.

Examples:

- Too many fillers → Practice replacing filler words with silent pauses
- Speaking too quickly → Focus on controlled pacing and pauses
- Frequent self-corrections → Plan the sentence before speaking
- Communication weakness identified → Receive a targeted practice recommendation

The goal is to turn analysis into an actionable next step.

### 🏆 Daily Speaking Prompts

- Curated speaking prompts provide realistic practice scenarios
- Prompts cover personal, professional and creative topics
- A refresh option allows learners to generate another prompt
- Prompts encourage spontaneous spoken communication

### 🔥 Streak Tracker

- Tracks consecutive practice days
- Displays the learner's current practice streak
- Encourages consistent speaking practice

### 📂 Session History

- Speaking sessions are stored in Supabase
- Previous sessions can be viewed from the dashboard
- History includes:
  - Date and time
  - Prompt
  - Speaking pace
  - Filler count
  - Correction count
- Individual sessions can be deleted from the interface

---

## 🧠 Adaptive Learning

The SIH26207 version extends recraftt. from a speech-analysis tool into an adaptive learning system.

The intended learning loop is:

```text
Assessment
    ↓
Skill Profile
    ↓
Gap Detection
    ↓
Personalised Mission
    ↓
Practice
    ↓
Reassessment
    ↓
Progress
````

Instead of giving every learner identical speaking exercises, the system uses their measured communication performance to identify areas that need attention.

For example:

```text
High Filler Usage
        ↓
Filler Control identified as weakness
        ↓
Silent-Pause Practice
        ↓
New Speaking Session
        ↓
Reassessment
```

This creates a continuous feedback loop where practice can become increasingly personalised to the learner.

---

## 📈 Communication Scoring

The current communication profile uses measurable signals from speaking sessions.

### Speaking Pace

The pace score evaluates how close the learner's speaking speed is to a balanced speaking range.

### Filler Control

The filler score is based on the proportion of filler words relative to the total number of spoken words.

### Fluency

The fluency score considers the frequency of detected self-corrections relative to the spoken response.

### Communication Trend

Repeated session scores are compared to identify whether the learner's communication performance is:

* **Improving**
* **Stable**
* **Declining**

The system uses recent sessions to reduce the effect of individual outlier recordings.

---

## 🔄 End-to-End Learning Flow

```text
Daily Prompt
     ↓
Voice Recording
     ↓
Whisper Transcription
     ↓
Speech Metrics
     ↓
Filler Detection
     ↓
Self-Correction Analysis
     ↓
AI Communication Analysis
     ↓
"A Better Way to Say It"
     ↓
Personalised Feedback
     ↓
Communication Profile
     ↓
Next Practice Recommendation
     ↓
Session History
     ↓
Reassessment
```

---

## 🏗️ Architecture

```text
recraftt/
├── app.py                 # FastAPI backend — REST API routes
├── transcriber.py         # Groq's Whisper speech transcription
├── analyzer.py            # Pace, filler & correction analysis
├── ai_analyzer.py         # Groq's GPT-OSS-120b AI communication analysis & rewriting
├── adaptive_engine.py     # Communication profile & adaptive scoring
├── feedback.py            # Feedback & mission generation
├── prompts.py             # Speaking prompt bank
├── tracker.py             # Session persistence & streak calculation
├── static/
│   ├── index.html         # Dashboard interface
│   ├── style.css          # UI design system
│   └── app.js             # Frontend logic & API integration
└── requirements.txt       # Python dependencies
```

---

## 🛠️ Tech Stack

| Layer              | Technology                                    |
| ------------------ | --------------------------------------------- |
| **Backend**        | Python · FastAPI · Uvicorn                    |
| **Speech-to-Text** | Whisper                                       |
| **AI / NLP**       | Groq API · `gpt-oss-120b`                     |
| **Frontend**       | Vanilla HTML · CSS · JavaScript               |
| **Design**         | Glassmorphism · Playfair Display · Canvas API |
| **Storage**        | Supabase                                      |

---

## 🎓 Smart Education Direction

recraftt. is designed around the idea that effective digital learning should respond to the individual learner.

A learner who struggles with filler words should not receive the same intervention as someone who speaks too quickly.

The system therefore aims to move from:

```text
Same Practice → Same Feedback
```

towards:

```text
Individual Assessment
        ↓
Individual Skill Profile
        ↓
Individual Weakness
        ↓
Individual Practice
        ↓
Individual Progress
```

This forms the foundation for an adaptive communication-learning platform.

---

## 🗺️ Roadmap

* [✔] User authentication & cloud session storage
* [✔] In-browser voice recording
* [✔] Whisper transcription
* [✔] Speaking pace analysis
* [✔] Filler-word detection
* [✔] Self-correction detection
* [✔] AI communication analysis
* [✔] Full-response AI rephrasing
* [✔] Personalised feedback
* [✔] Next-session recommendations
* [✔] Communication Profile
* [✔] Session History
* [✔] Adaptive communication scoring
* [ ] Expanded adaptive practice categories
* [ ] Long-term progress visualisation
* [ ] Advanced pronunciation analysis
* [ ] Expanded learning analytics

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd recraftt.
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file containing the required API and database credentials.

### 6. Start the server

```bash
uvicorn app:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

---

## 📌 Project Goal

recraftt. aims to turn spoken communication practice into a measurable and personalised learning experience.

Instead of simply telling a learner whether their speech was "good" or "bad", the system identifies specific communication patterns, explains how to improve them, recommends what to practise next, and tracks performance across sessions.

The long-term goal is:

> **Assess → Personalise → Practise → Reassess → Improve**

---

## 📄 License

This project is a prototype developed for Smart India Hackathon 2026.

---

<p align="center">
Built to help students speak better, one session at a time.
</p>

