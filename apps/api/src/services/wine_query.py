from typing import List

from src.db.supabase import get_supabase_client
from src.models.slots import SlotState
from src.models.wine import Wine


def filter_wines(slots: SlotState, limit: int = 5) -> List[Wine]:
    supabase = get_supabase_client()
    query = supabase.table("wines").select("*")

    if slots.budget_hkd:
        query = query.lte("price_hkd", slots.budget_hkd)
    if slots.wine_type and slots.wine_type.lower() not in ("any", ""):
        query = query.eq("type", slots.wine_type)
    if slots.region:
        query = query.ilike("region", f"%{slots.region}%")

    response = query.eq("in_stock", True).order("score", desc=True).limit(limit).execute()
    return [Wine(**item) for item in response.data]
