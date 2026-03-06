from fastapi import APIRouter, Depends, HTTPException, status
from schema import promptRequest, promptResponse
from core import get_current_user
from core import savePrompt
from services import useGroq

router = APIRouter()

# @router.post("/prompt", response_model=promptResponse)
# def run_prompt(request: promptRequest, current_user: str = Depends(get_current_user)):
#     try:
        