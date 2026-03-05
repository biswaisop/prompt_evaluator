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
    user_id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    hashed_password: str
    created_at: datetime = datetime.now(timezone.utc)

    model_config = {"populate_by_name": True}