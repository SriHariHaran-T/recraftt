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
    "Explain how AI will change the way we work in the next 10 years.",
    "Describe the best meal you've ever had and why it was memorable.",
    "If you could master any skill instantly, what would it be and why?",
    "Talk about a book, movie, or podcast that impacted you.",
    "Describe a time you felt proud of yourself.",
    "What's something you'd like to be known for?",
    "Talk about your favorite place in the world and why you love it.",
    "If you could give your younger self one piece of advice, what would it be?",
    "Describe a technology you think is overrated.",
    "What's a small thing that makes your day better?",
    "Talk about a travel experience that changed your perspective.",
    "Describe your ideal work environment.",
    "What's a topic you could talk about for hours?",
    "Talk about a failure that led to a success.",
    "If you could have dinner with any three people, who would they be?",
    "Describe a skill you think everyone should learn.",
    "What's something you're grateful for today?",
    "Talk about a time you stepped outside your comfort zone.",
    "Describe your perfect day from morning to night.",
    "What's a recent discovery that excited you?",
    "Talk about a habit you're trying to build or break.",
    "If you could solve one world problem, what would it be?",
    "Describe a leader you admire and why."
]

def get_daily_prompt():
    return random.choice(PROMPTS)