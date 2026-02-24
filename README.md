# 🌊 CFD Simulation Chatbot

An AI-powered chatbot for querying CFD (Computational Fluid Dynamics) simulation results using **RAG (Retrieval-Augmented Generation)**, **LangChain**, and **ChromaDB** vector database.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│     File Upload Panel          Chat Interface                │
└───────────┬───────────────────────────┬─────────────────────┘
            │ HTTP / REST               │ HTTP / REST
┌───────────▼───────────────────────────▼─────────────────────┐
│                    FastAPI Backend                           │
│   /api/upload     /api/chat      /health                     │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   RAG Service                        │   │
│   │                                                      │   │
│   │  CFD Log Files → Text Splitter → OpenAI Embeddings  │   │
│   │                                      ↓              │   │
│   │                              ChromaDB VectorStore    │   │
│   │                                      ↓              │   │
│   │  User Query → Similarity Search → Context + LLM     │   │
│   │                                      ↓              │   │
│   │                              GPT-4o-mini Response    │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Features

- **Upload CFD Log Files** — supports `.log`, `.txt`, `.dat`, `.out`, `.csv`, `.res`
- **Semantic Search** — ChromaDB vector database for similarity retrieval
- **Conversational Memory** — multi-turn chat with session-based history
- **Source Attribution** — responses show which files were used
- **CFD-Aware Prompting** — specialized system prompt for simulation analysis
- **Background Indexing** — files are indexed asynchronously after upload

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Frontend    | React 18 + Vite                |
| Backend     | FastAPI + Python 3.11+         |
| LLM         | OpenAI GPT-4o-mini             |
| Embeddings  | OpenAI text-embedding-3-small  |
| Vector DB   | ChromaDB (local persistence)   |
| RAG Chain   | LangChain                      |

---

## 🚀 Quick Start

See individual READMEs:
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)

### Run Both at Once (after setup)

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## Usage

1. **Upload** your CFD simulation log files via the left panel
2. **Wait** a few seconds for indexing to complete
3. **Ask** questions in natural language:
   - *"Did the simulation converge?"*
   - *"What are the final residuals for velocity?"*
   - *"Were there any solver warnings?"*
   - *"What is the maximum Courant number?"*
   - *"Summarize the simulation performance"*

## Project Structure

```
cfd-chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── core/config.py       # Settings & env vars
│   │   ├── api/
│   │   │   ├── chat.py          # Chat endpoints
│   │   │   └── upload.py        # File upload endpoints
│   │   └── services/
│   │       └── rag_service.py   # RAG core logic
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx   # Chat UI
│   │   │   └── FilePanel.jsx    # File upload UI
│   │   ├── hooks/useChat.js     # Chat state management
│   │   └── services/api.js      # API client
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md
```
