def calculate_pace(text, segments):
    if not segments or not text.strip():
        return 0, 0, 0

    word_count = len(text.split())
    total_duration = segments[-1]["end"]
    duration_minutes = total_duration / 60
    pace = word_count / duration_minutes
    return pace, word_count, total_duration

def detect_fillers(text):
    filler_words = ["um", "uh", "mm", "hmm", "like", "you know", "so",
                     "actually", "basically", "literally", "right", "okay", "well"]
    lower_text = text.lower()
    filler_counts = {}
    for filler in filler_words:
        count = lower_text.count(filler)
        if count > 0:
            filler_counts[filler] = count
    return filler_counts

def detect_corrections(text):
    correction_markers = ["i meant", "sorry", "what i meant was",
                           "let me rephrase", "correction", "i mean"]
    lower_text = text.lower()
    found = [marker for marker in correction_markers if marker in lower_text]
    return found