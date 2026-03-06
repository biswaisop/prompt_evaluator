from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import AuthRouter, PromptRouter, HistoryRouter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(AuthRouter, prefix="/auth", tags=["auth"])
app.include_router(PromptRouter, prefix="/api", tags=["prompt"])
app.include_router(HistoryRouter, prefix="/api", tags=["history"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

