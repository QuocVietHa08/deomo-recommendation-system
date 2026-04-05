import json
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel

from src.db.supabase import get_supabase_client

router = APIRouter(prefix="/api", tags=["sessions"])


class MessageRecord(BaseModel):
    role: str
    content: str
    recommendations: Optional[List[Dict[str, Any]]] = None


class SessionRecord(BaseModel):
    id: str
    session_id: str
    title: str
    created_at: str
    messages: List[MessageRecord] = []


class CreateSessionRequest(BaseModel):
    title: str = "New Conversation"


class SaveMessagesRequest(BaseModel):
    messages: List[MessageRecord]
    title: Optional[str] = None


@router.post("/sessions", response_model=SessionRecord)
def create_session(body: CreateSessionRequest) -> SessionRecord:
    client = get_supabase_client()
    session_id = str(uuid4())
    result = (
        client.table("chat_sessions")
        .insert({"title": body.title, "session_id": session_id, "messages": []})
        .execute()
    )
    row = result.data[0]
    return SessionRecord(
        id=row["id"],
        session_id=row["session_id"],
        title=row["title"],
        created_at=row["created_at"],
        messages=[],
    )


@router.get("/sessions", response_model=List[SessionRecord])
def list_sessions() -> List[SessionRecord]:
    client = get_supabase_client()
    result = (
        client.table("chat_sessions")
        .select("*")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    sessions = []
    for row in result.data:
        raw_messages = row.get("messages") or []
        if isinstance(raw_messages, str):
            raw_messages = json.loads(raw_messages)
        messages = [MessageRecord(**m) for m in raw_messages]
        sessions.append(
            SessionRecord(
                id=row["id"],
                session_id=row["session_id"],
                title=row["title"],
                created_at=row["created_at"],
                messages=messages,
            )
        )
    return sessions


@router.patch("/sessions/{session_db_id}")
def save_messages(session_db_id: str, body: SaveMessagesRequest) -> dict:
    client = get_supabase_client()
    update: Dict[str, Any] = {
        "messages": [m.model_dump() for m in body.messages],
    }
    if body.title:
        update["title"] = body.title
    client.table("chat_sessions").update(update).eq("id", session_db_id).execute()
    return {"ok": True}
