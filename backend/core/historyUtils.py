from core.db import history_collection
from datetime import datetime, timezone
from bson import ObjectId
from schema.prompt import historyEntry

def savePrompt(user_id: str, prompt: str, response: str,
                model: str, temperature: float,
                max_tokens: int, tokens_used: int):
    history = historyEntry(
        user_id=user_id,
        prompt=prompt,
        response=response,
        model=model,
        temp=temperature,
        max_token=max_tokens,
        token_used=tokens_used,
        created_at=datetime.now(timezone.utc)
    )
    result = history_collection.insert_one(history.model_dump(by_alias=True, exclude_none=True))
    return str(result.inserted_id)


def get_history_by_user(user_id: str) -> list[dict]:
    cursor = history_collection.find({"_id": user_id}).sort("created_at", -1)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_entry_by_id(entry_id: str) -> dict:
    entry_data = history_collection.find_one({"_id": ObjectId(entry_id)})
    if entry_data:
        entry_data["_id"] = str(entry_data["_id"])
        return entry_data
    return None

def delete_entry_by_id(entry_id: str, user_id: str) -> bool:
    result = history_collection.delete_one({"_id": ObjectId(entry_id), "user_id": user_id})
    return result.deleted_count == 1