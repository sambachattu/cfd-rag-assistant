from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, upload
from app.core.config import settings

app = FastAPI(
    title="CFD Simulation Chatbot API",
    description="RAG-powered chatbot for querying CFD simulation results",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
