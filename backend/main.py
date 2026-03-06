from fastapi import FastAPI
from routes import AuthRouter

app = FastAPI()

app.include_router(AuthRouter, prefix="/auth", tags=["auth"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

