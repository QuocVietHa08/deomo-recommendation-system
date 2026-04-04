import asyncio
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from src.models.wine import Wine
from src.services.recommender import generate_followup, generate_recommendation
from src.services.slot_extractor import extract_slots
from src.services.wine_query import filter_wines
from src.session.redis import get_session, save_session

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    slots: dict
    recommendations: Optional[List[Wine]] = None
    done: bool = False


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    session = await get_session(request.session_id)

    session.history.append({"role": "user", "content": request.message})
    session.turn_count += 1

    print(f"[chat] turn={session.turn_count} session={request.session_id} msg={request.message!r}")

    new_slots = await asyncio.to_thread(extract_slots, request.message)
    session.slots = session.slots.merge(new_slots)

    print(f"[chat] slots={session.slots.model_dump()}")

    if session.slots.is_ready():
        wines = await asyncio.to_thread(filter_wines, session.slots)
        reply = await asyncio.to_thread(generate_recommendation, session.slots, wines)
        done = True
        recommendations = wines
    else:
        reply = await asyncio.to_thread(generate_followup, session.slots)
        done = False
        recommendations = None

    print(f"[chat] done={done} reply={reply[:60]!r}")

    session.history.append({"role": "assistant", "content": reply})
    await save_session(request.session_id, session)

    return ChatResponse(
        reply=reply,
        slots=session.slots.model_dump(),
        recommendations=recommendations,
        done=done,
    )
