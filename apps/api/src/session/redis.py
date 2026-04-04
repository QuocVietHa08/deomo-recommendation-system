import redis.asyncio as aioredis

from src.config import settings
from src.models.session import SessionData

SESSION_TTL = 1800  # 30 minutes

redis_client: aioredis.Redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


def _key(session_id: str) -> str:
    return f"session:{session_id}"


async def get_session(session_id: str) -> SessionData:
    """Fetch session from Redis; returns fresh SessionData if not found."""
    raw = await redis_client.get(_key(session_id))
    return SessionData.model_validate_json(raw) if raw else SessionData()


async def save_session(session_id: str, data: SessionData) -> None:
    """Persist session to Redis with TTL."""
    await redis_client.setex(_key(session_id), SESSION_TTL, data.model_dump_json())
