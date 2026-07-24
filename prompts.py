import random

PROMPTS = [
    "Tell me about a challenge you recently overcame.",
    "Describe your ideal weekend and why you'd enjoy it.",
    "Talk about a skill you're currently trying to improve.",
    "Describe a person who has influenced you and how.",
    "Explain a topic you're passionate about to someone new to it.",
    "Talk about a mistake you learned something valuable from.",
    "Describe your morning routine and how it sets up your day.",
    "Talk about a goal you're working towards this year.",
]

def get_daily_prompt():
    return random.choice(PROMPTS)