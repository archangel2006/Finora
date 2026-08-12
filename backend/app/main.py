from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import routes_chat

# app: FastAPI entrypoint, wires up routers + CORS for the Next.js frontend --

app = FastAPI(title="Investment Committee Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_chat.router, prefix="/chat", tags=["chat"])


# route: simple health check for uptime monitoring ------------------------
@app.get("/health")
def health():
    return {"status": "ok"}