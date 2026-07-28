//Supabase integration
const SUPABASE_URL = "https://lyrtphxopdpnhhqjerbb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnRwaHhvcGRwbmhocWplcmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNTU2NTgsImV4cCI6MjEwMDczMTY1OH0.9ocEPUPhs-F15bPvyyTO8FbwAloqaz9PFWet2PZSejs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Variables
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let secondsElapsed = 0;
let timerInterval = null;
let currentPrompt = "";

// Audio Visualization
let audioCtx = null;
let analyser = null;
let dataArray = null;
let source = null;
let animationFrameId = null;

// DOM Elements
const promptText = document.getElementById('promptText');
const newPromptBtn = document.getElementById('newPromptBtn');
const recordBtn = document.getElementById('recordBtn');
const recordingTimer = document.getElementById('recordingTimer');
const waveformCanvas = document.getElementById('waveformCanvas');
const recordStatusText = document.getElementById('recordStatusText');
const emptyAnalytics = document.getElementById('emptyAnalytics');
const resultsView = document.getElementById('resultsView');
const loadingModal = document.getElementById('loadingModal');

// Metric Fields
const streakCount = document.getElementById('streakCount');
const resultsPromptBadge = document.getElementById('resultsPromptBadge');
const paceVal = document.getElementById('paceVal');
const paceGaugeFill = document.getElementById('paceGaugeFill');
const durationVal = document.getElementById('durationVal');
const wordsVal = document.getElementById('wordsVal');
const transcriptText = document.getElementById('transcriptText');
const fillerCloud = document.getElementById('fillerCloud');
const correctionList = document.getElementById('correctionList');
const aiAnalysisContainer = document.getElementById('aiAnalysisContainer');
const missionText = document.getElementById('missionText');
const feedbackPoints = document.getElementById('feedbackPoints');
const historyList = document.getElementById('historyList');

// Canvas Setup
const canvasCtx = waveformCanvas.getContext('2d');
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    waveformCanvas.width = waveformCanvas.offsetWidth * window.devicePixelRatio;
    waveformCanvas.height = waveformCanvas.offsetHeight * window.devicePixelRatio;
    canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchPrompt();
    fetchHistoryAndStreak();
    drawStaticWaveform();
});

// Fetch Speaking Prompt
async function fetchPrompt() {
    try {
        promptText.textContent = "Fetching prompt...";
        const response = await fetch('/api/prompt');
        const data = await response.json();
        currentPrompt = data.prompt;
        promptText.textContent = currentPrompt;
    } catch (err) {
        promptText.textContent = "Could not load today's prompt. Try clicking reload.";
        console.error(err);
    }
}

newPromptBtn.addEventListener('click', fetchPrompt);

// Fetch History and Streaks
async function fetchHistoryAndStreak() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();

        // Update streak
        streakCount.textContent = data.streak || 0;

        // Update history sidebar
        renderHistoryList(data.history || []);
    } catch (err) {
        console.error("Error loading history:", err);
    }
}

// Render History Items
function renderHistoryList(history) {
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<div class="status-pulse" style="grid-column: 1/-1; padding: 2rem;">No previous sessions recorded.</div>';
        return;
    }

    // Show newer sessions first while keeping track of original index
    const sortedHistory = history.map((session, index) => ({ session, index })).reverse();

    sortedHistory.forEach(({ session, index }) => {
        const card = document.createElement('div');
        card.className = 'history-card';

        const totalFillers = Object.values(session.filler_counts || {}).reduce((a, b) => a + b, 0);

        card.innerHTML = `
            <div class="history-meta">
                <span>${session.date} • ${session.time}</span>
                <button class="delete-session-btn" title="Delete Session">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
            <h4>${session.prompt || 'Speaking Practice'}</h4>
            <div class="history-stats">
                <span class="history-stat-pill">${session.pace} WPM</span>
                <span class="history-stat-pill">${totalFillers} Fillers</span>
                <span class="history-stat-pill">${session.corrections ? session.corrections.length : 0} Corrections</span>
            </div>
        `;

        // Trash button handler
        const deleteBtn = card.querySelector('.delete-session-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent card click
            if (confirm("Delete this session record?")) {
                deleteSessionItem(index);
            }
        });

        card.addEventListener('click', () => {
            displaySessionResults(session);
            // Scroll results view into view on mobile
            resultsView.scrollIntoView({ behavior: 'smooth' });
        });

        historyList.appendChild(card);
    });
}

// Delete session item by API
async function deleteSessionItem(index) {
    try {
        const response = await fetch(`/api/history/${index}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const data = await response.json();
            streakCount.textContent = data.streak || 0;
            renderHistoryList(data.history || []);
        } else {
            alert("Failed to delete session.");
        }
    } catch (err) {
        console.error("Error deleting session:", err);
    }
}

// Draw a flat static waveform initially
function drawStaticWaveform() {
    const width = waveformCanvas.width / window.devicePixelRatio;
    const height = waveformCanvas.height / window.devicePixelRatio;
    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    canvasCtx.lineWidth = 2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, height / 2);
    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();
}

// Recording Functionality
recordBtn.addEventListener('click', toggleRecording);

async function toggleRecording() {
    if (!isRecording) {
        // Start Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up Audio Context and Visualizer
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            // Configure MediaRecorder
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = uploadAndAnalyze;

            mediaRecorder.start();
            isRecording = true;
            recordBtn.classList.add('recording');
            recordStatusText.textContent = "Recording in progress... speak clearly";

            // Start Timer
            secondsElapsed = 0;
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                secondsElapsed++;
                updateTimerDisplay();
            }, 1000);

            // Start Visualizer Loop
            drawLiveWaveform();

        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Could not access microphone. Please grant mic permissions and try again.");
        }
    } else {
        // Stop Recording
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        isRecording = false;
        recordBtn.classList.remove('recording');
        recordStatusText.textContent = "Processing recording...";

        // Stop timer & audio loop
        clearInterval(timerInterval);
        if (audioCtx) {
            audioCtx.close();
        }
        cancelAnimationFrame(animationFrameId);
        drawStaticWaveform();
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    recordingTimer.textContent = `${mins}:${secs}`;
}

// Live waveform animation
function drawLiveWaveform() {
    const width = waveformCanvas.width / window.devicePixelRatio;
    const height = waveformCanvas.height / window.devicePixelRatio;

    animationFrameId = requestAnimationFrame(drawLiveWaveform);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgba(11, 15, 25, 0.2)'; // semi-translucent clear
    canvasCtx.fillRect(0, 0, width, height);

    const barWidth = (width / dataArray.length) * 1.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2;

        // Custom emerald to cyan colors matching theme
        const red = 16 + (i * 2);
        const green = 185 - (i * 0.5);
        const blue = 129 + (i * 0.8);
        canvasCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

        // Draw centered bars
        canvasCtx.fillRect(x, (height / 2) - (barHeight / 2), barWidth - 2, barHeight);

        x += barWidth;
    }
}

// Upload Blob & Analyze
async function uploadAndAnalyze() {
    loadingModal.classList.remove('hidden');

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'speaking_practice.webm');
    formData.append('prompt', currentPrompt);

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Server analysis error");
        }

        const result = await response.ok ? await response.json() : null;
        if (result) {
            displaySessionResults(result);
            fetchHistoryAndStreak(); // refresh history & streak count
        }
    } catch (err) {
        console.error("Analysis failed:", err);
        alert(err.message || "Failed to process audio. Please try again.");
    } finally {
        loadingModal.classList.add('hidden');
        recordStatusText.textContent = "Click below to start practicing";
        recordingTimer.textContent = "00:00";
    }
}

// Render Analysis Results
function displaySessionResults(data) {
    emptyAnalytics.classList.add('hidden');
    resultsView.classList.remove('hidden');

    resultsPromptBadge.textContent = data.prompt || "Speaking Practice";
    paceVal.textContent = data.pace;
    durationVal.textContent = data.duration;
    wordsVal.textContent = data.word_count;
    transcriptText.textContent = data.transcript;

    // Pace Gauge percentage (balanced is around 110-160 WPM, range map to 0-100%)
    let pacePercentage = (data.pace / 240) * 100;
    pacePercentage = Math.min(Math.max(pacePercentage, 5), 95); // clamp
    paceGaugeFill.style.width = `${pacePercentage}%`;

    // Render Filler Words Cloud
    fillerCloud.innerHTML = '';
    const fillers = data.filler_counts || {};
    const fillerKeys = Object.keys(fillers);

    if (fillerKeys.length === 0) {
        fillerCloud.innerHTML = '<span class="status-pulse text-sm">None detected</span>';
    } else {
        fillerKeys.forEach(word => {
            const tag = document.createElement('span');
            tag.className = 'filler-tag';
            tag.innerHTML = `"${word}" <span>${fillers[word]}x</span>`;
            fillerCloud.appendChild(tag);
        });
    }

    // Render Self-Corrections
    correctionList.innerHTML = '';
    const corrections = data.corrections || [];
    if (corrections.length === 0) {
        correctionList.innerHTML = '<li class="status-pulse text-sm">None detected</li>';
    } else {
        corrections.forEach(marker => {
            const item = document.createElement('li');
            item.className = 'correction-item';
            item.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m21 16-4 4-4-4"></path>
                    <path d="M17 20V4"></path>
                </svg>
                <span>Correction word: "${marker}"</span>
            `;
            correctionList.appendChild(item);
        });
    }

    // Render AI Rephrasing Suggestions
    aiAnalysisContainer.innerHTML = '';
    const aiText = data.ai_repetition_analysis || "";

    if (!aiText || aiText.includes("None detected")) {
        aiAnalysisContainer.innerHTML = '<div class="status-pulse text-sm">No rephrasings needed — ideas flowed cleanly.</div>';
    } else {
        // Parse "Original: <what they said>\nSuggestion: <clearer way>" format
        const lines = aiText.split('\n');
        let currentItem = {};
        const parsedItems = [];

        lines.forEach(line => {
            if (line.startsWith('Original:')) {
                currentItem.original = line.substring(9).trim();
            } else if (line.startsWith('Suggestion:')) {
                currentItem.suggestion = line.substring(11).trim();
                parsedItems.push({ ...currentItem });
                currentItem = {};
            }
        });

        if (parsedItems.length === 0) {
            // fallback if it printed something custom
            const card = document.createElement('div');
            card.className = 'ai-suggestion-card';
            card.textContent = aiText;
            aiAnalysisContainer.appendChild(card);
        } else {
            parsedItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'ai-suggestion-card';
                card.innerHTML = `
                    <div class="ai-original">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        ${item.original}
                    </div>
                    <div class="ai-suggested">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        ${item.suggestion}
                    </div>
                `;
                aiAnalysisContainer.appendChild(card);
            });
        }
    }

    // Render Mission & Feedback
    missionText.textContent = data.mission || "Keep practicing speaking with confidence!";

    feedbackPoints.innerHTML = '';
    const points = data.feedback || [];
    points.forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        feedbackPoints.appendChild(li);
    });
}
const isMobile = window.innerWidth < 600;
async function renderProgressChart() {
    const response = await fetch('/api/history');
    const data = await response.json();
    const history = data.history;

    if (!history || history.length === 0) return;

    const labels = history.map((entry, i) => `Session ${i + 1}`);
    const paces = history.map(entry => entry.pace);
    const fillerTotals = history.map(entry =>
        Object.values(entry.filler_counts || {}).reduce((sum, count) => sum + count, 0)
    );
    const correctionCounts = history.map(entry => (entry.corrections || []).length);

    const ctx = document.getElementById('progressChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Speaking Pace (WPM)',
                    data: paces,
                    borderColor: '#4A90D9',
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Filler Words',
                    data: fillerTotals,
                    borderColor: '#E07A5F',
                    yAxisID: 'y1',
                    tension: 0.3
                },
                {
                    label: 'Self-Corrections',
                    data: correctionCounts,
                    borderColor: '#81B29A',
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        pointRadius: isMobile ? 2 : 2,
                        padding: isMobile ? 2 : 4
                    }
                },
                title: {
                    display: true,
                    text: 'Speaking Progress Over Time',
                    font: {
                        size: isMobile ? 12 : 12
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Words per minute' },
                    ticks: {
                        font: {
                            size: isMobile ? 8 : 12
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Count' },
                    grid: { drawOnChartArea: false },
                    ticks: {
                        font: {
                            size: isMobile ? 8 : 12
                        }
                    }
                }
            }
        }
    });
}

renderProgressChart();

document.getElementById("loginBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google"
    });
    if (error) console.error("Login error:", error);
});

// Check if user is already logged in in when page loads
async function checkUser() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    let userName;
    if (session) {
        userName = session.user.user_metadata.name.split(" ")[0];
        document.getElementById("loginBtn").classList.add("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
        document.getElementById("userInfo").textContent = `Signed in as ${userName}`;
        document.getElementById("userInfo").classList.remove("hidden");
    } else {
        document.getElementById("loginBtn").classList.remove("hidden");
        document.getElementById("logoutBtn").classList.add("hidden");
        document.getElementById("userInfo").classList.add("hidden");
    }
}

checkUser();

document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        console.error("Logout error:", error);
        return;
    }
    location.reload();
});