# Backend — FastAPI + RAG

## Prerequisites

- Python 3.11+
- OpenAI API Key ([get one here](https://platform.openai.com/api-keys))

## Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

## Environment Variables

| Variable               | Default                  | Description                            |
|------------------------|--------------------------|----------------------------------------|
| `OPENAI_API_KEY`       | *required*               | Your OpenAI API key                    |
| `LLM_MODEL`            | `gpt-4o-mini`            | OpenAI model for chat                  |
| `EMBEDDING_MODEL`      | `text-embedding-3-small` | OpenAI model for embeddings            |
| `CHROMA_PERSIST_DIR`   | `./chroma_db`            | Where ChromaDB stores its data         |
| `UPLOAD_DIR`           | `./uploads`              | Where uploaded files are saved         |
| `CHUNK_SIZE`           | `1000`                   | Text chunk size for indexing           |
| `CHUNK_OVERLAP`        | `200`                    | Overlap between chunks                 |
| `TOP_K_RESULTS`        | `5`                      | Number of chunks retrieved per query   |
| `MAX_FILE_SIZE_MB`     | `50`                     | Max upload file size in MB             |
| `ALLOWED_ORIGINS`      | `[localhost:5173, 3000]` | CORS allowed origins (JSON array)      |

## Run

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/health`                 | Health check                         |
| POST   | `/api/upload/`            | Upload & index a CFD log file        |
| DELETE | `/api/upload/{filename}`  | Remove file from index               |
| POST   | `/api/chat/`              | Send a chat message (RAG response)   |
| GET    | `/api/chat/files`         | List all indexed files               |
| POST   | `/api/chat/clear-session` | Clear conversation history           |

### Interactive API Docs
Visit **http://localhost:8000/docs** (Swagger UI) after starting the server.

## How RAG Works

1. **Upload** — CFD log file is saved to disk
2. **Chunk** — File split into overlapping text chunks (1000 chars, 200 overlap)
3. **Embed** — Each chunk is embedded via OpenAI `text-embedding-3-small`
4. **Store** — Embeddings stored in ChromaDB with source metadata
5. **Query** — User question is embedded, top-5 similar chunks retrieved
6. **Generate** — Retrieved context + conversation history sent to GPT-4o-mini
7. **Respond** — Answer returned with source file attribution

## Data Persistence

- ChromaDB persists to `./chroma_db/` — indexed files survive restarts
- Uploaded files are saved to `./uploads/`
- Conversation history is in-memory per session (cleared on restart)
