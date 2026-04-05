from typing import List

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from src.config import settings
from src.models.slots import SlotState
from src.models.wine import Wine

RECOMMEND_SYSTEM = """You are VinoBuzz, a friendly AI sommelier.
Given the user's preferences and the wine list below, write only a short warm 1-2 sentence intro message.
Do NOT list the wines or their details — they will be shown separately as cards to the user.
If any wine is priced above the user's stated budget, briefly acknowledge it (e.g. "slightly above your budget but worth it").
Be warm, confident, and concise."""

FOLLOWUP_SYSTEM = """You are VinoBuzz, a friendly AI sommelier.
You are gathering information to recommend wines. Based on what you know so far,
ask a natural follow-up question to fill in the missing details.
Missing info: {missing}
Keep it conversational. One question only."""

_llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY, temperature=0.7)

_recommend_prompt = ChatPromptTemplate.from_messages([
    ("system", RECOMMEND_SYSTEM),
    ("human", (
        "User preferences:\n"
        "Budget: {budget}\nOccasion: {occasion}\nType: {wine_type}\n"
        "Region: {region}\nFood: {food_pairing}\n\n"
        "Available wines:\n{wines}"
    )),
])
_followup_prompt = ChatPromptTemplate.from_messages([
    ("system", FOLLOWUP_SYSTEM),
    ("human", "What should I ask next?"),
])

_recommend_chain = _recommend_prompt | _llm | StrOutputParser()
_followup_chain = _followup_prompt | _llm | StrOutputParser()


def generate_recommendation(slots: SlotState, wines: List[Wine]) -> str:
    wines_text = "\n".join(
        f"- {w.name} ({w.type}, {w.region}, HKD {w.price_hkd}, score: {w.score})"
        for w in wines
    )
    return _recommend_chain.invoke({
        "budget": slots.budget_hkd or "any",
        "occasion": slots.occasion or "any",
        "wine_type": slots.wine_type or "any",
        "region": slots.region or "any",
        "food_pairing": slots.food_pairing or "any",
        "wines": wines_text,
    })


def generate_followup(slots: SlotState) -> str:
    missing = []
    if slots.budget_hkd is None:
        missing.append("budget")
    if slots.occasion is None and slots.wine_type is None:
        missing.append("occasion or wine type")
    elif slots.occasion is None:
        missing.append("occasion")
    elif slots.wine_type is None:
        missing.append("wine type preference")
    return _followup_chain.invoke({"missing": ", ".join(missing)})
