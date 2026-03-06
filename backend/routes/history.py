from fastapi import APIRouter, Depends, HTTPException, status
from core import get_current_user, get_history_by_user, get_entry_by_id, delete_entry_by_id
from schema import userInDB
HistoryRouter = APIRouter()

@HistoryRouter.get("/getEntries")
def get_history(current_user: userInDB = Depends(get_current_user)):
    entries = get_history_by_user(current_user.user_id)
    return {"entries": entries, "total": len(entries)}

@HistoryRouter.get("/getHistory/{entry_id}")
def get_entry(entry_id: str, current_user = Depends(get_current_user)):
    entry = get_entry_by_id(entry_id)
    if not entry or entry["user_id"] != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry

@HistoryRouter.delete("/deleteHistory/{entry_id}")
def delete_entry(entry_id: str, current_user = Depends(get_current_user)):
    deleted = delete_entry_by_id(entry_id, current_user.user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return {"message": "Entry deleted"}