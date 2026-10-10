def generate_feedback(pace, filler_counts, corrections):
    feedback = []

    # Pace
    if pace < 110:
        feedback.append("Your pace was a bit slow today. Try adding a touch more energy to keep your listener engaged.")
    elif pace > 160:
        feedback.append("You spoke quite fast. Slowing down slightly could help your ideas land more clearly.")
    else:
        feedback.append("Your speaking pace was well-balanced and easy to follow.")

    # Fillers
    total_fillers = sum(filler_counts.values())
    most_common_filler = max(filler_counts, key=filler_counts.get) if filler_counts else None

    if total_fillers == 0:
        feedback.append("Great job! No filler words detected in this session.")
    elif total_fillers <= 2:
        feedback.append(f"You used {total_fillers} filler word(s). That's pretty minimal. Nice control.")
    else:
        feedback.append(f"You used {total_fillers} filler word(s), most often '{most_common_filler}'. Try pausing silently instead of filling gaps with words.")

    # Corrections
    if corrections:
        feedback.append(f"You self-corrected {len(corrections)} time(s) mid-response. Try pausing to plan your sentence before speaking.")

    # Mission
    if total_fillers > 2:
        mission = f"Tomorrow, focus on replacing '{most_common_filler}' with a brief pause instead."
    elif corrections:
        mission = "Tomorrow, try pausing for a second before you start speaking to plan your first sentence."
    elif pace > 160:
        mission = "Tomorrow, consciously slow down during your key points."
    elif pace < 110:
        mission = "Tomorrow, try to speak with a bit more energy and pacing variation."
    else:
        mission = "Tomorrow, try extending your response by 10-15 seconds while keeping this same clarity."

    return feedback, mission