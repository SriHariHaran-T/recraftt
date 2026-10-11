// recraftt. – local-user frontend (no Supabase / no auth required)

// --------------------------------------------------------------------------
// State Variables
// --------------------------------------------------------------------------
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

// --------------------------------------------------------------------------
// DOM Elements
// --------------------------------------------------------------------------
const promptText = document.getElementById('promptText');
const newPromptBtn = document.getElementById('newPromptBtn');
const recordBtn = document.getElementById('recordBtn');
const recordingTimer = document.getElementById('recordingTimer');
const waveformCanvas = document.getElementById('waveformCanvas');
const recordStatusText = document.getElementById('recordStatusText');
const emptyAnalytics = document.getElementById('emptyAnalytics');
const resultsView = document.getElementById('resultsView');
const loadingModal = document.getElementById('loadingModal');

// Metric fields
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
const closeSessionBtn = document.getElementById('closeSessionBtn');

// --------------------------------------------------------------------------
// Canvas Setup
// --------------------------------------------------------------------------
const canvasCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;
if (waveformCanvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!waveformCanvas) return;
    waveformCanvas.width = waveformCanvas.offsetWidth * window.devicePixelRatio;
    waveformCanvas.height = waveformCanvas.offsetHeight * window.devicePixelRatio;
    canvasCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

document.addEventListener('DOMContentLoaded', () => {
    drawStaticWaveform();
});

// --------------------------------------------------------------------------
// Close Session Button
// --------------------------------------------------------------------------
if (closeSessionBtn) {
    closeSessionBtn.addEventListener('click', () => {
        resultsView.classList.add('hidden');
        emptyAnalytics.classList.remove('hidden');
    });
}

// --------------------------------------------------------------------------
// Fetch Speaking Prompt
// --------------------------------------------------------------------------
async function fetchPrompt() {
    try {
        if (promptText) promptText.textContent = "Fetching prompt...";
        const response = await fetch('/api/prompt');
        const data = await response.json();
        currentPrompt = data.prompt;
        if (promptText) promptText.textContent = currentPrompt;
    } catch (err) {
        if (promptText) promptText.textContent = "Could not load today's prompt. Try clicking reload.";
        console.error("fetchPrompt error:", err);
    }
}

if (newPromptBtn) {
    newPromptBtn.addEventListener('click', fetchPrompt);
}

// --------------------------------------------------------------------------
// Fetch History and Streak
// --------------------------------------------------------------------------
async function fetchHistoryAndStreak() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error(`History API returned ${response.status}`);
        const data = await response.json();
        if (streakCount) streakCount.textContent = data.streak || 0;
        renderHistoryList(data.history || []);
    } catch (err) {
        console.error("Error loading history:", err);
    }
}

// --------------------------------------------------------------------------
// Fetch Adaptive Profile
// --------------------------------------------------------------------------
async function fetchAdaptiveProfile() {
    try {
        const response = await fetch('/api/adaptive-profile');
        if (!response.ok) throw new Error(`Adaptive profile API returned ${response.status}`);
        const data = await response.json();

        if (data) {
            const profileSection = document.getElementById('profileSection');
            if (profileSection) profileSection.classList.remove('hidden');

            if (data.trend === "needs_more_data") {
                document.getElementById('profPaceScore').textContent = "-";
                document.getElementById('profPaceBar').style.width = "0%";
                document.getElementById('profFillerScore').textContent = "-";
                document.getElementById('profFillerBar').style.width = "0%";
                document.getElementById('profFluencyScore').textContent = "-";
                document.getElementById('profFluencyBar').style.width = "0%";
                document.getElementById('profTrend').textContent = "More data needed";
                document.getElementById('profFocus').textContent = "Building baseline";
                document.getElementById('profRec').textContent = "Complete another speaking session to unlock personalized coaching.";
            } else {
                document.getElementById('profPaceScore').textContent = data.pace_score;
                document.getElementById('profPaceBar').style.width = `${data.pace_score}%`;
                document.getElementById('profFillerScore').textContent = data.filler_score;
                document.getElementById('profFillerBar').style.width = `${data.filler_score}%`;
                document.getElementById('profFluencyScore').textContent = data.correction_score;
                document.getElementById('profFluencyBar').style.width = `${data.correction_score}%`;
                document.getElementById('profTrend').textContent = data.trend.replace('_', ' ');
                document.getElementById('profFocus').textContent = data.primary_weakness.replace('_', ' ');
                document.getElementById('profRec').textContent = data.recommended_exercise;
            }

            // Challenge level badges
            const badge = document.getElementById('profChallengeLevel');
            const popoverBadge = document.getElementById('popoverLevelBadge');
            if (data.challenge_level) {
                if (badge) {
                    badge.textContent = data.challenge_level;
                    badge.className = 'challenge-badge ' + data.challenge_level.toLowerCase();
                }
                if (popoverBadge) {
                    popoverBadge.textContent = data.challenge_level;
                    popoverBadge.className = 'challenge-badge ' + data.challenge_level.toLowerCase();
                }
            }
        }
    } catch (err) {
        console.error("Error loading adaptive profile:", err);
    }
}

// --------------------------------------------------------------------------
// Render History List
// --------------------------------------------------------------------------
function renderHistoryList(history) {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (!history || history.length === 0) {
        historyList.innerHTML = '<div class="status-pulse" style="grid-column: 1/-1; padding: 2rem;">No previous sessions recorded.</div>';
        return;
    }

    // History comes in DESC order from server; show as-is (newest first)
    history.forEach((session) => {
        const card = document.createElement('div');
        card.className = 'history-card';

        const totalFillers = Object.values(session.filler_counts || {}).reduce((a, b) => a + b, 0);
        const sessionDate = new Date(session.created_at);

        card.innerHTML = `
            <div class="history-meta">
                <span>${sessionDate.toLocaleDateString()} • ${sessionDate.toLocaleTimeString()}</span>
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
            e.stopPropagation();
            if (confirm("Delete this session record?")) {
                deleteSessionItem(session.id);
            }
        });

        card.addEventListener('click', () => {
            displaySessionResults(session);
            if (resultsView) resultsView.scrollIntoView({ behavior: 'smooth' });
        });

        historyList.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// Delete Session
// --------------------------------------------------------------------------
async function deleteSessionItem(sessionId) {
    try {
        const response = await fetch(`/api/history/${sessionId}`, { method: 'DELETE' });
        if (response.ok) {
            const data = await response.json();
            if (streakCount) streakCount.textContent = data.streak || 0;
            renderHistoryList(data.history || []);
        } else {
            alert("Failed to delete session.");
        }
    } catch (err) {
        console.error("Error deleting session:", err);
    }
}

// --------------------------------------------------------------------------
// Static Waveform
// --------------------------------------------------------------------------
function drawStaticWaveform() {
    if (!canvasCtx || !waveformCanvas) return;
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

// --------------------------------------------------------------------------
// Recording
// --------------------------------------------------------------------------
if (recordBtn) {
    recordBtn.addEventListener('click', toggleRecording);
}

async function toggleRecording() {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };
            mediaRecorder.onstop = uploadAndAnalyze;
            mediaRecorder.start();

            isRecording = true;
            recordBtn.classList.add('recording');
            if (recordStatusText) recordStatusText.textContent = "Recording in progress... speak clearly";

            secondsElapsed = 0;
            updateTimerDisplay();
            timerInterval = setInterval(() => {
                secondsElapsed++;
                updateTimerDisplay();
            }, 1000);

            drawLiveWaveform();

        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Could not access microphone. Please grant mic permissions and try again.");
        }
    } else {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        isRecording = false;
        recordBtn.classList.remove('recording');
        if (recordStatusText) recordStatusText.textContent = "Processing recording...";

        clearInterval(timerInterval);
        if (audioCtx) audioCtx.close();
        cancelAnimationFrame(animationFrameId);
        drawStaticWaveform();
    }
}

function updateTimerDisplay() {
    if (!recordingTimer) return;
    const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const secs = (secondsElapsed % 60).toString().padStart(2, '0');
    recordingTimer.textContent = `${mins}:${secs}`;
}

function drawLiveWaveform() {
    if (!canvasCtx || !waveformCanvas || !analyser) return;
    const width = waveformCanvas.width / window.devicePixelRatio;
    const height = waveformCanvas.height / window.devicePixelRatio;

    animationFrameId = requestAnimationFrame(drawLiveWaveform);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgba(11, 15, 25, 0.2)';
    canvasCtx.fillRect(0, 0, width, height);

    const barWidth = (width / dataArray.length) * 1.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        const red = Math.min(77 + (i * 0.5), 99);
        const green = Math.min(168 + (i * 0.2), 179);
        const blue = Math.min(255 - (i * 0.4), 255);
        canvasCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        canvasCtx.fillRect(x, (height / 2) - (barHeight / 2), barWidth - 2, barHeight);
        x += barWidth;
    }
}

// --------------------------------------------------------------------------
// Upload & Analyze
// --------------------------------------------------------------------------
async function uploadAndAnalyze() {
    if (loadingModal) loadingModal.classList.remove('hidden');

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'speaking_practice.webm');
    formData.append('prompt', currentPrompt);

    try {
        const response = await fetch('/api/analyze-audio', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Server analysis error");
        }

        const result = await response.json();
        if (result) {
            displaySessionResults(result);
            fetchHistoryAndStreak();
            fetchAdaptiveProfile();
        }
    } catch (err) {
        console.error("Analysis failed:", err);
        alert(err.message || "Failed to process audio. Please try again.");
    } finally {
        if (loadingModal) loadingModal.classList.add('hidden');
        if (recordStatusText) recordStatusText.textContent = "Click below to start practicing";
        if (recordingTimer) recordingTimer.textContent = "00:00";
    }
}

// --------------------------------------------------------------------------
// Display Session Results
// --------------------------------------------------------------------------
function displaySessionResults(data) {
    if (emptyAnalytics) emptyAnalytics.classList.add('hidden');
    if (resultsView) resultsView.classList.remove('hidden');

    if (resultsPromptBadge) resultsPromptBadge.textContent = data.prompt || "Speaking Practice";
    if (paceVal) paceVal.textContent = data.pace;
    if (durationVal) durationVal.textContent = data.duration;
    if (wordsVal) wordsVal.textContent = data.total_words;
    if (transcriptText) transcriptText.textContent = data.transcript;

    // Pace gauge
    if (paceGaugeFill) {
        let pacePercentage = (data.pace / 240) * 100;
        pacePercentage = Math.min(Math.max(pacePercentage, 5), 95);
        paceGaugeFill.style.width = `${pacePercentage}%`;
    }

    // Filler Words Cloud
    if (fillerCloud) {
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
    }

    // Self-Corrections
    if (correctionList) {
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
    }

    // AI "A Better Way to Say It"
    if (aiAnalysisContainer) {
        aiAnalysisContainer.innerHTML = '';
        const aiText = data.ai_repetition_analysis || "";
        const originalTranscript = data.transcript || "";

        if (!aiText || aiText.includes("None detected")) {
            aiAnalysisContainer.innerHTML = '<div class="status-pulse text-sm">No rephrasing needed — your ideas flowed clearly.</div>';
        } else {
            let betterWay = "";
            let aiOriginal = originalTranscript;

            if (typeof aiText === "object" && aiText !== null) {
                betterWay = aiText.better_way || "";
                aiOriginal = aiText.original || originalTranscript;
            } else {
                const cleanedText = String(aiText).trim();
                try {
                    const parsed = JSON.parse(cleanedText);
                    if (parsed && typeof parsed === "object") {
                        betterWay = parsed.better_way || "";
                        aiOriginal = parsed.original || originalTranscript;
                    }
                } catch (e) {
                    const suggestionMatch = cleanedText.match(/(?:Better way|Suggestion|Rephrased|Improved):\s*(.+)/is);
                    betterWay = suggestionMatch ? suggestionMatch[1].trim() : cleanedText;
                }
            }

            if (!betterWay) betterWay = "Try expressing the same idea in a shorter, clearer way.";

            const section = document.createElement('div');
            section.className = 'better-way-card';

            const youSaid = document.createElement('div');
            youSaid.className = 'better-way-original';
            const originalLabel = document.createElement('div');
            originalLabel.className = 'better-way-label';
            originalLabel.textContent = 'YOU SAID';
            const originalTextEl = document.createElement('div');
            originalTextEl.className = 'better-way-text original';
            originalTextEl.textContent = `"${aiOriginal}"`;
            youSaid.appendChild(originalLabel);
            youSaid.appendChild(originalTextEl);

            const better = document.createElement('div');
            better.className = 'better-way-suggestion';
            const betterLabel = document.createElement('div');
            betterLabel.className = 'better-way-label';
            betterLabel.textContent = 'A CLEARER WAY TO SAY IT';
            const betterTextEl = document.createElement('div');
            betterTextEl.className = 'better-way-text';
            betterTextEl.textContent = betterWay;
            better.appendChild(betterLabel);
            better.appendChild(betterTextEl);

            section.appendChild(youSaid);
            section.appendChild(better);
            aiAnalysisContainer.appendChild(section);
        }
    }

    // Mission & Feedback
    if (missionText) missionText.textContent = data.mission || "Keep practicing speaking with confidence!";
    if (feedbackPoints) {
        feedbackPoints.innerHTML = '';
        const points = data.feedback || [];
        points.forEach(pt => {
            const li = document.createElement('li');
            li.textContent = pt;
            feedbackPoints.appendChild(li);
        });
    }
}

// --------------------------------------------------------------------------
// Progress Chart
// --------------------------------------------------------------------------
const isMobile = window.innerWidth < 600;

async function renderProgressChart() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) return;
        const data = await response.json();
        const history = data.history;

        if (!history || history.length === 0) return;

        const chartCanvas = document.getElementById('progressChart');
        if (!chartCanvas) {
            console.warn("Progress chart canvas not found.");
            return;
        }
        const ctx = chartCanvas.getContext('2d');

        // Remove previous chart instance if present
        if (chartCanvas._chartInstance) {
            chartCanvas._chartInstance.destroy();
        }

        const labels = history.map((_, i) => `Session ${i + 1}`);
        const paces = history.map(e => e.pace);
        const fillerTotals = history.map(e => Object.values(e.filler_counts || {}).reduce((s, c) => s + c, 0));
        const correctionCounts = history.map(e => (e.corrections || []).length);

        const blueGradient = ctx.createLinearGradient(0, 0, 0, 400);
        blueGradient.addColorStop(0, 'rgba(77, 168, 255, 0.4)');
        blueGradient.addColorStop(1, 'rgba(77, 168, 255, 0.0)');

        const amberGradient = ctx.createLinearGradient(0, 0, 0, 400);
        amberGradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        amberGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

        const greenGradient = ctx.createLinearGradient(0, 0, 0, 400);
        greenGradient.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
        greenGradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');

        chartCanvas._chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Speaking Pace (WPM)',
                        data: paces,
                        borderColor: '#4da8ff',
                        backgroundColor: blueGradient,
                        fill: true,
                        yAxisID: 'y',
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: '#060d1f',
                        pointBorderColor: '#4da8ff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Filler Words',
                        data: fillerTotals,
                        borderColor: '#F59E0B',
                        backgroundColor: amberGradient,
                        fill: true,
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: '#060d1f',
                        pointBorderColor: '#F59E0B',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Self-Corrections',
                        data: correctionCounts,
                        borderColor: '#34d399',
                        backgroundColor: greenGradient,
                        fill: true,
                        yAxisID: 'y1',
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: '#060d1f',
                        pointBorderColor: '#34d399',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        labels: {
                            color: '#f0f4ff',
                            usePointStyle: true,
                            pointStyle: 'circle',
                            pointRadius: isMobile ? 3 : 4,
                            padding: isMobile ? 10 : 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'Speaking Progress Over Time',
                        color: '#f0f4ff',
                        font: { size: isMobile ? 14 : 16, family: "'Google Sans', sans-serif", weight: '600' },
                        padding: { bottom: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 22, 48, 0.9)',
                        titleColor: '#f0f4ff',
                        bodyColor: '#8ba3c9',
                        borderColor: 'rgba(255, 255, 255, 0.09)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: { display: false, drawBorder: false },
                        ticks: { color: '#8ba3c9', font: { size: isMobile ? 10 : 12 } }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Words per minute', color: '#6b90bd' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#8ba3c9', font: { size: isMobile ? 10 : 12 } }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Count', color: '#6b90bd' },
                        grid: { display: false },
                        ticks: { color: '#8ba3c9', font: { size: isMobile ? 10 : 12 }, stepSize: 1 }
                    }
                }
            }
        });
    } catch (err) {
        console.error("renderProgressChart error:", err);
    }
}

// --------------------------------------------------------------------------
// Avatar Helpers
// --------------------------------------------------------------------------
function getInitials(name) {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function renderUserAvatar(containerEl, initials) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'avatar-initials';
    span.textContent = initials;
    containerEl.appendChild(span);
}

// --------------------------------------------------------------------------
// Profile Popover Toggle
// --------------------------------------------------------------------------
const userAvatarBtn = document.getElementById('userAvatarBtn');
const profilePopover = document.getElementById('profilePopover');

function toggleProfilePopover(forceState) {
    if (!profilePopover || !userAvatarBtn) return;
    const shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : !profilePopover.classList.contains('open');

    if (shouldOpen) {
        profilePopover.classList.add('open');
        userAvatarBtn.setAttribute('aria-expanded', 'true');
    } else {
        profilePopover.classList.remove('open');
        userAvatarBtn.setAttribute('aria-expanded', 'false');
    }
}

function closeProfilePopover() { toggleProfilePopover(false); }

if (userAvatarBtn) {
    userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfilePopover();
    });
}

document.addEventListener('click', (e) => {
    if (profilePopover && profilePopover.classList.contains('open')) {
        if (!profilePopover.contains(e.target) && userAvatarBtn && !userAvatarBtn.contains(e.target)) {
            closeProfilePopover();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profilePopover && profilePopover.classList.contains('open')) {
        closeProfilePopover();
    }
});

// --------------------------------------------------------------------------
// Edit Profile (display name)
// --------------------------------------------------------------------------
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileForm = document.getElementById('editProfileForm');
const profileNameInput = document.getElementById('profileNameInput');
const profileErrorMsg = document.getElementById('profileErrorMsg');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (!editProfileForm) return;
        editProfileForm.classList.toggle('hidden');
        if (!editProfileForm.classList.contains('hidden') && profileNameInput) {
            const currentName = document.getElementById('popoverUserName')?.textContent || '';
            profileNameInput.value = currentName;
            profileNameInput.focus();
        }
        if (profileErrorMsg) profileErrorMsg.style.display = 'none';
    });
}

if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
        if (editProfileForm) editProfileForm.classList.add('hidden');
        if (profileErrorMsg) profileErrorMsg.style.display = 'none';
    });
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!profileNameInput) return;
        const newName = profileNameInput.value.trim();

        if (!newName || newName.length > 40) {
            if (profileErrorMsg) {
                profileErrorMsg.textContent = newName ? 'Name must be 40 characters or fewer.' : 'Name cannot be empty.';
                profileErrorMsg.style.display = 'block';
            }
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_name: newName })
            });
            if (!response.ok) {
                const err = await response.json();
                if (profileErrorMsg) {
                    profileErrorMsg.textContent = err.detail || 'Failed to save.';
                    profileErrorMsg.style.display = 'block';
                }
                return;
            }
            const updated = await response.json();
            applyUserName(updated.display_name);
            if (editProfileForm) editProfileForm.classList.add('hidden');
            if (profileErrorMsg) profileErrorMsg.style.display = 'none';
        } catch (err) {
            console.error("Error saving profile:", err);
            if (profileErrorMsg) {
                profileErrorMsg.textContent = 'Network error. Please try again.';
                profileErrorMsg.style.display = 'block';
            }
        }
    });
}

function applyUserName(name) {
    const initials = getInitials(name);

    const headerAvatar = document.getElementById('headerAvatar');
    const popoverAvatar = document.getElementById('popoverAvatar');
    const profLearnerAvatar = document.getElementById('profLearnerAvatar');
    renderUserAvatar(headerAvatar, initials);
    renderUserAvatar(popoverAvatar, initials);
    renderUserAvatar(profLearnerAvatar, initials);

    const popoverUserName = document.getElementById('popoverUserName');
    if (popoverUserName) popoverUserName.textContent = name;

    const profLearnerName = document.getElementById('profLearnerName');
    if (profLearnerName) profLearnerName.textContent = name;
}

// --------------------------------------------------------------------------
// Initialize – show dashboard immediately (no auth required)
// --------------------------------------------------------------------------
async function initDashboard() {
    // 1. Reveal the dashboard right away
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    if (loginContainer) loginContainer.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');

    // 2. Show avatar button, hide stale login button in header
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    if (headerLoginBtn) headerLoginBtn.classList.add('hidden');
    if (userAvatarBtn) userAvatarBtn.classList.remove('hidden');

    // 3. Load profile from backend
    try {
        const res = await fetch('/api/profile');
        if (res.ok) {
            const profile = await res.json();
            applyUserName(profile.display_name || 'Learner');
        } else {
            applyUserName('Learner');
        }
    } catch (e) {
        applyUserName('Learner');
        console.warn("Profile fetch failed:", e);
    }

    // 4. Load all dashboard data in parallel
    await Promise.all([
        fetchPrompt(),
        fetchHistoryAndStreak(),
        renderProgressChart(),
        fetchAdaptiveProfile()
    ]);
}

initDashboard().catch(err => console.error("Dashboard initialization error:", err));
