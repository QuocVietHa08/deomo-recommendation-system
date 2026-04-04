import json

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from src.config import settings
from src.models.slots import SlotState

SLOT_SYSTEM = """You are a slot extractor for a wine sommelier app.
Extract structured data from the user message into JSON.
Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "budget_hkd": number | null,
  "occasion": string | null,
  "wine_type": "Red" | "White" | "Sparkling" | "Rosé" | "Any" | null,
  "region": string | null,
  "food_pairing": string | null
}
Never invent values. If not mentioned, return null."""

_llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY, temperature=0)
_prompt = ChatPromptTemplate.from_messages([
    ("system", SLOT_SYSTEM),
    ("human", "{message}"),
])
_chain = _prompt | _llm | StrOutputParser()


def extract_slots(message: str) -> SlotState:
    raw = _chain.invoke({"message": message})
    try:
        data = json.loads(raw)
        return SlotState(**{k: v for k, v in data.items() if v is not None})
    except Exception:
        return SlotState()
