from typing import List, Optional

from src.db.supabase import get_supabase_client
from src.models.slots import SlotState
from src.models.wine import Wine


def _run_query(
    budget_hkd: Optional[int],
    wine_type: Optional[str],
    region: Optional[str],
    limit: int,
) -> List[Wine]:
    supabase = get_supabase_client()
    query = supabase.table("wines").select("*").eq("in_stock", True)

    if budget_hkd:
        query = query.lte("price_hkd", budget_hkd)
    if wine_type and wine_type.lower() not in ("any", ""):
        query = query.eq("type", wine_type)
    if region:
        query = query.ilike("region", f"%{region}%")

    response = query.order("score", desc=True).limit(limit).execute()
    return [Wine(**item) for item in response.data]


def filter_wines(slots: SlotState, limit: int = 5) -> List[Wine]:
    """
    Try progressively relaxed queries until we get results.
    1. Exact match (budget + type + region)
    2. Relax budget by 50% extra headroom
    3. Drop region
    4. Drop type
    5. Return top-scored wines regardless
    """
    # Attempt 1: strict
    wines = _run_query(slots.budget_hkd, slots.wine_type, slots.region, limit)
    if wines:
        return wines

    # Attempt 2: budget with 50% headroom (user may have underestimated)
    relaxed_budget = int(slots.budget_hkd * 1.5) if slots.budget_hkd else None
    wines = _run_query(relaxed_budget, slots.wine_type, slots.region, limit)
    if wines:
        return wines

    # Attempt 3: drop region constraint
    wines = _run_query(relaxed_budget, slots.wine_type, None, limit)
    if wines:
        return wines

    # Attempt 4: drop type constraint too
    wines = _run_query(relaxed_budget, None, None, limit)
    if wines:
        return wines

    # Attempt 5: no budget constraint — return best available
    return _run_query(None, None, None, limit)
