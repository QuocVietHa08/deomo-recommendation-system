from typing import Optional
from pydantic import BaseModel


class SlotState(BaseModel):
    budget_hkd: Optional[int] = None
    occasion: Optional[str] = None
    wine_type: Optional[str] = None   # "Red"|"White"|"Sparkling"|"Rosé"|"Any"
    region: Optional[str] = None
    food_pairing: Optional[str] = None

    def is_ready(self) -> bool:
        """Must have budget + at least occasion OR wine_type."""
        return self.budget_hkd is not None and (
            self.occasion is not None or self.wine_type is not None
        )

    def merge(self, other: "SlotState") -> "SlotState":
        """Merge: new message slots take priority; fall back to existing slots for gaps."""
        return SlotState(
            budget_hkd=other.budget_hkd if other.budget_hkd is not None else self.budget_hkd,
            occasion=other.occasion if other.occasion is not None else self.occasion,
            wine_type=other.wine_type if other.wine_type is not None else self.wine_type,
            region=other.region if other.region is not None else self.region,
            food_pairing=other.food_pairing if other.food_pairing is not None else self.food_pairing,
        )
