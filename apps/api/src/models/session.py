from typing import Any, Dict, List
from pydantic import BaseModel

from src.models.slots import SlotState


class SessionData(BaseModel):
    slots: SlotState = SlotState()
    history: List[Dict[str, Any]] = []
    turn_count: int = 0
