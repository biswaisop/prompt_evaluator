from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from schema import promptRequest, promptResponse
from core import get_current_user
from core import savePrompt
from services import groq_response, groq_stream
import json

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


@PromptRouter.post("/prompt/stream")
def run_prompt_stream(request: promptRequest, current_user: str = Depends(get_current_user)):
    def event_generator():
        full_output = ""
        model = "unknown"
        token_used = 0
        try:
            for chunk in groq_stream(
                api_key=request.api_key,
                max_tokens=request.max_token,
                temperature=request.temp,
                query=request.prompt,
            ):
                token = chunk.content or ""
                full_output += token

                # Extract metadata from the last chunk
                meta = chunk.response_metadata or {}
                if meta.get("model_name"):
                    model = meta["model_name"]
                usage = meta.get("token_usage")
                if usage:
                    token_used = usage.get("total_tokens", token_used)

                yield f"data: {json.dumps({'token': token})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        # Save to history after streaming completes
        savePrompt(
            user_id=current_user.user_id,
            prompt=request.prompt,
            response=full_output,
            model=model,
            temperature=request.temp,
            max_tokens=request.max_token,
            tokens_used=token_used,
        )

        # Send final event with metadata
        yield f"data: {json.dumps({'done': True, 'model': model, 'token_used': token_used})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")