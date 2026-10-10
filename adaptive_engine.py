def calculate_pace_score(pace):
    """
    Calculate pace score based on an ideal range of 130-160 WPM.
    """
    if pace is None or pace == 0:
        return 0

    if 130 <= pace <= 160:
        return 100
    elif pace < 130:
        return max(0, int(100 - (130 - pace) * 2))
    else:
        return max(0, int(100 - (pace - 160) * 1.5))

def calculate_filler_score(total_fillers, total_words):
    """
    Calculate filler word control score.
    Fewer fillers per word results in a higher score.
    """
    if not total_words or total_words == 0:
        return 100
    
    rate_percentage = (total_fillers / total_words) * 100
    # Penalty: 7 points per 1% of words being fillers
    return max(0, int(100 - (rate_percentage * 7)))

def calculate_correction_score(total_corrections, total_words):
    """
    Calculate self-correction (fluency) score.
    Fewer corrections per word results in a higher score.
    """
    if not total_words or total_words == 0:
        return 100

    rate_percentage = (total_corrections / total_words) * 100
    # Penalty: 8 points per 1% of words being self-corrections
    return max(0, int(100 - (rate_percentage * 8)))

def calculate_trend(scores):
    """
    Compare the older half of scores with the newer half to determine a trend.
    scores is a list of chronological overall scores.
    """
    n = len(scores)
    if n < 2:
        return "stable"

    mid = n // 2
    older_half = scores[:mid]
    newer_half = scores[mid:]

    older_avg = sum(older_half) / len(older_half)
    newer_avg = sum(newer_half) / len(newer_half)

    if newer_avg > older_avg + 5:
        return "improving"
    elif older_avg > newer_avg + 5:
        return "declining"
    else:
        return "stable"

def analyze_user_progress(history):
    """
    Produce a communication skill profile based on the user's history.
    History should be sorted by created_at (descending) as it comes from the DB,
    so we will reverse it for chronological trend calculations.
    """
    if not history or len(history) < 2:
        return {
            "primary_weakness": "general",
            "secondary_weakness": "none",
            "pace_score": 0,
            "filler_score": 0,
            "correction_score": 0,
            "trend": "needs_more_data",
            "recommended_exercise": "Practice a random prompt to gather more data.",
            "challenge_level": "FOUNDATION"
        }

    # Reverse to chronological (oldest first)
    chronological_history = list(reversed(history))

    overall_scores = []
    
    # Let's average the last 3 sessions (or all if < 3) to be robust against outliers.
    recent_sessions = chronological_history[-3:]
    
    avg_pace = sum(s.get("pace", 0) or 0 for s in recent_sessions) / len(recent_sessions)
    
    total_fillers_recent = 0
    total_words_recent = 0
    total_corrections_recent = 0
    
    for s in recent_sessions:
        fillers = s.get("filler_counts", {})
        if fillers:
            total_fillers_recent += sum(fillers.values())
        total_words_recent += s.get("total_words", 0) or 0
        corrections = s.get("corrections", [])
        if corrections:
            total_corrections_recent += len(corrections)

    current_pace_score = calculate_pace_score(avg_pace)
    current_filler_score = calculate_filler_score(total_fillers_recent, total_words_recent)
    current_correction_score = calculate_correction_score(total_corrections_recent, total_words_recent)

    # Calculate scores for all sessions for trend analysis
    for s in chronological_history:
        p_val = s.get("pace", 0) or 0
        w_val = s.get("total_words", 0) or 0
        f_counts = s.get("filler_counts", {})
        f_val = sum(f_counts.values()) if f_counts else 0
        c_list = s.get("corrections", [])
        c_val = len(c_list) if c_list else 0

        p_score = calculate_pace_score(p_val)
        f_score = calculate_filler_score(f_val, w_val)
        c_score = calculate_correction_score(c_val, w_val)
        
        overall_session_score = (p_score + f_score + c_score) / 3
        overall_scores.append(overall_session_score)

    trend = calculate_trend(overall_scores)

    # Identify weaknesses
    score_map = {
        "pace": current_pace_score,
        "filler_words": current_filler_score,
        "fluency": current_correction_score
    }
    
    sorted_weaknesses = sorted(score_map.items(), key=lambda item: item[1])
    primary_weakness = sorted_weaknesses[0][0]
    secondary_weakness = sorted_weaknesses[1][0]

    # Recommendations
    recommendation_map = {
        "pace": "Practice speaking with a metronome or focus on pausing at commas and periods.",
        "filler_words": "Use short silent pauses instead of 'um', 'uh', 'like', etc.",
        "fluency": "Take a deep breath and plan your sentence before starting it to avoid mid-sentence corrections."
    }
    
    recommended_exercise = recommendation_map.get(primary_weakness, "Practice a random prompt.")

    # Calculate Challenge Level
    recent_overall_score = (current_pace_score + current_filler_score + current_correction_score) / 3

    if recent_overall_score < 60 or (trend == "declining" and recent_overall_score < 70):
        challenge_level = "FOUNDATION"
    elif recent_overall_score >= 85 and trend != "declining":
        challenge_level = "CHALLENGE"
    else:
        challenge_level = "DEVELOPING"

    return {
        "primary_weakness": primary_weakness,
        "secondary_weakness": secondary_weakness,
        "pace_score": current_pace_score,
        "filler_score": current_filler_score,
        "correction_score": current_correction_score,
        "trend": trend,
        "recommended_exercise": recommended_exercise,
        "challenge_level": challenge_level
    }
