from typing import List, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from src.db.supabase import get_supabase_client
from src.models.wine import Wine

router = APIRouter(prefix="/api", tags=["wines"])

PAGE_SIZE = 12


class WinesPage(BaseModel):
    items: List[Wine]
    total: int
    page: int
    page_size: int
    has_more: bool


@router.get("/wines", response_model=WinesPage)
def list_wines(
    type: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    in_stock: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
) -> WinesPage:
    client = get_supabase_client()

    def apply_filters(q):
        if type:
            q = q.eq("type", type)
        if min_price is not None:
            q = q.gte("price_hkd", min_price)
        if max_price is not None:
            q = q.lte("price_hkd", max_price)
        if in_stock is not None:
            q = q.eq("in_stock", in_stock)
        return q

    # Count total matching rows
    count_q = apply_filters(client.table("wines").select("id", count="exact"))
    count_result = count_q.execute()
    total = count_result.count or 0

    # Fetch paginated slice
    offset = (page - 1) * PAGE_SIZE
    data_q = apply_filters(client.table("wines").select("*"))
    data_result = data_q.order("price_hkd").range(offset, offset + PAGE_SIZE - 1).execute()

    items = [Wine(**row) for row in data_result.data]

    return WinesPage(
        items=items,
        total=total,
        page=page,
        page_size=PAGE_SIZE,
        has_more=(offset + len(items)) < total,
    )
