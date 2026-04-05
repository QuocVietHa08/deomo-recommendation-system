from typing import List, Optional
from pydantic import BaseModel


class Wine(BaseModel):
    id: str
    name: str
    region: str
    country: str
    type: str
    variety: Optional[str] = None
    price_hkd: int
    score: Optional[int] = None
    body: Optional[str] = None
    tasting_notes: Optional[str] = None
    occasions: Optional[List[str]] = None
    food_pairings: Optional[List[str]] = None
    in_stock: bool = True
    thumb_url: Optional[str] = None


class Recommendation(BaseModel):
    wines: List[Wine]
    narrative: str
