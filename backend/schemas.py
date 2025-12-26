from pydantic import BaseModel
from typing import List

class VoteRequest(BaseModel):
    user: str
    ordered_gifts: List[str]
