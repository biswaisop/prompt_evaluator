from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class promptRequest(BaseModel):
    api_key: str
    prompt: str
    temp: float = Field(default=0.7, ge=0.0, le=1.0)
    max_token: int = Field(default=512, ge=100, le=2000)

class promptResponse(BaseModel):
    output: str
    model: str
    token_used: int

class historyEntry(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    prompt: str
    model: str
    response: str
    temp: float
    max_token: int
    token_used: int
    created_at: datetime = datetime.now(timezone.utc)

    model_config = {"populate_by_name": True}


class historyResponse(BaseModel):
    entries: list[historyEntry]
    total: int

