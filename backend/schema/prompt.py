from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional

class promptRequest(BaseModel):
    prompt: str
    temp: float = Field(default=0.7, ge=0.0, le=1.0)
    max_token: int = Field(default=512, ge=100, le=2000)

class promptResponse(BaseModel):
    output: str
    model: str
    token_used: int

class historyEntry(BaseModel):
    prompt: str
    model: str
    temp: float
    max_token: int
    token_used: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class historyResponse(BaseModel):
    entries: list[historyEntry]
    total: int