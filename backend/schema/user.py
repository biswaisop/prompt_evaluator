from typing import Optional
from pydantic import EmailStr, BaseModel, Field
from datetime import datetime, timezone

class SignUp(BaseModel):
    name: str
    email: EmailStr
    password: str

class loginRequest(BaseModel):
    email: EmailStr
    password: str


class tokenResponse(BaseModel):
    access_token: str
    toekn_type: str = "bearer"

class userInDB(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))