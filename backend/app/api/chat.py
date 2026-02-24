from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import rag_service
import uuid

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    session_id: str


class ClearSessionRequest(BaseModel):
    session_id: str


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    session_id = request.session_id or str(uuid.uuid4())

    try:
        result = await rag_service.chat(
            question=request.question,
            session_id=session_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clear-session")
async def clear_session(request: ClearSessionRequest):
    rag_service.clear_session(request.session_id)
    return {"message": "Session cleared"}


@router.get("/files")
async def list_files():
    try:
        files = rag_service.list_indexed_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
