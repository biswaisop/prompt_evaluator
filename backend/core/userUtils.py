from db import users_collection
from datetime import datetime, timezone
from schema.user import userInDB
from bson import ObjectId
def createuser(name: str, email: str, hashed_password: str) -> dict:
    user = userInDB(
        name = name,
        email = email,
        hashed_password = hashed_password,
        created_at = datetime.now(timezone.utc)
    )

    result = users_collection.insert_one(user.model_dump(by_alias=True, exclude_none=True))

    return str(result.inserted_id)

def getuserbyemail(email: str) -> dict:
    user_data = users_collection.find_one({"email": email})
    if user_data:
        user_data["_id"] = str(user_data["_id"])
        return userInDB(**user_data)
    return None

def getuserbyid(id: str) -> dict:
    user_data = users_collection.find_one({"_id": ObjectId(id)})
    if user_data:
            user_data["_id"] = str(user_data["_id"])
    return user_data

