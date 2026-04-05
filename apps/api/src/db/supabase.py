from typing import Optional

from supabase import create_client, Client

from src.config import settings

_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client
