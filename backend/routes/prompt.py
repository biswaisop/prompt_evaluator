from fastapi import APIRouter, Depends, HTTPException, status
from schema import promptRequest, promptResponse
from core import get_current_user
from core import savePrompt
from services import groq_response

PromptRouter = APIRouter()

@PromptRouter.post("/prompt", response_model=promptResponse)
def run_prompt(request: promptRequest, current_user: str = Depends(get_current_user)):
    try:
        result = groq_response(
            api_key = request.api_key,
            max_tokens=request.max_token,
            temperature=request.temp,
            query=request.prompt
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM Service error {str(e)}"
        )
    output = result.content
    model = result.response_metadata.get("model_name", "unknown")
    token_used = result.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    
    savePrompt(
        user_id=current_user.user_id,
        prompt=request.prompt,
        response=output,
        model=model,
        temperature=request.temp,
        max_tokens=request.max_token,
        tokens_used=token_used
    )

    return promptResponse(output=output, model=model, token_used=token_used)