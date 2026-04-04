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
        """Accumulate slots: never overwrite an already-filled slot."""
        return SlotState(
            budget_hkd=self.budget_hkd if self.budget_hkd is not None else other.budget_hkd,
            occasion=self.occasion if self.occasion is not None else other.occasion,
            wine_type=self.wine_type if self.wine_type is not None else other.wine_type,
            region=self.region if self.region is not None else other.region,
            food_pairing=self.food_pairing if self.food_pairing is not None else other.food_pairing,
        )
