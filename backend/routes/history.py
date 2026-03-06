from fastapi import APIRouter, Depends, HTTPException, status
from core import get_current_user, get_history_by_user, get_entry_by_id, delete_entry_by_id


