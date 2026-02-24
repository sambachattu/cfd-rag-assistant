import os
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.rag_service import rag_service
from app.core.config import settings

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


def _validate_file(filename: str, size: int):
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}"
        )
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )


@router.post("/")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    content = await file.read()
    _validate_file(file.filename, len(content))

    save_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(content)

    # Index in background
    def index_file():
        try:
            chunks = rag_service.ingest_file(
                save_path,
                metadata={"original_filename": file.filename}
            )
            return chunks
        except Exception as e:
            raise RuntimeError(f"Indexing failed: {e}")

    background_tasks.add_task(index_file)

    return {
        "message": f"File '{file.filename}' uploaded and indexing started",
        "filename": file.filename,
        "size_bytes": len(content)
    }


@router.delete("/{filename}")
async def delete_file(filename: str):
    deleted = rag_service.delete_file(filename)

    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    if not deleted:
        raise HTTPException(status_code=404, detail="File not found in index")

    return {"message": f"File '{filename}' deleted from index"}
