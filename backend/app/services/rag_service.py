import os
from pathlib import Path
from typing import List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

CFD_SYSTEM_PROMPT = """You are an expert CFD (Computational Fluid Dynamics) simulation analyst assistant. 
You help engineers and researchers understand their simulation results by analyzing log files, 
residuals, convergence data, and other simulation outputs.

Use the following retrieved simulation context to answer questions accurately:

Context:
{context}

Chat History:
{chat_history}

Question: {question}

Guidelines:
- Be precise with numerical values found in the logs
- Identify convergence issues, warnings, or errors if present
- Explain CFD concepts clearly when needed
- If data is not in the context, say so clearly
- Format numbers and units properly
- Highlight any critical warnings or simulation failures

Answer:"""


class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL,
            temperature=0.1,
            openai_api_key=settings.OPENAI_API_KEY
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""]
        )
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        self.vectorstore = Chroma(
            collection_name=settings.CHROMA_COLLECTION_NAME,
            embedding_function=self.embeddings,
            persist_directory=settings.CHROMA_PERSIST_DIR
        )
        self._sessions: dict = {}

    def _get_or_create_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        if session_id not in self._sessions:
            self._sessions[session_id] = ConversationBufferWindowMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer",
                k=10
            )
        return self._sessions[session_id]

    def ingest_file(self, file_path: str, metadata: dict = None) -> int:
        """Process and index a CFD log file into the vector store."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        base_metadata = {
            "source": path.name,
            "file_path": str(file_path),
            "file_type": path.suffix,
        }
        if metadata:
            base_metadata.update(metadata)

        docs = [Document(page_content=content, metadata=base_metadata)]
        chunks = self.text_splitter.split_documents(docs)

        # Add unique IDs to avoid duplicates
        ids = [f"{path.name}_{i}" for i in range(len(chunks))]
        self.vectorstore.add_documents(chunks, ids=ids)

        logger.info(f"Indexed {len(chunks)} chunks from {path.name}")
        return len(chunks)

    def list_indexed_files(self) -> List[dict]:
        """List all files indexed in the vector store."""
        collection = self.vectorstore._collection
        results = collection.get(include=["metadatas"])
        
        seen = {}
        for meta in results["metadatas"]:
            src = meta.get("source", "unknown")
            if src not in seen:
                seen[src] = {
                    "source": src,
                    "file_type": meta.get("file_type", ""),
                }
        return list(seen.values())

    def delete_file(self, filename: str) -> bool:
        """Remove all chunks from a specific file."""
        collection = self.vectorstore._collection
        results = collection.get(include=["metadatas"])
        
        ids_to_delete = [
            results["ids"][i]
            for i, meta in enumerate(results["metadatas"])
            if meta.get("source") == filename
        ]
        
        if ids_to_delete:
            collection.delete(ids=ids_to_delete)
            return True
        return False

    async def chat(self, question: str, session_id: str) -> dict:
        """Answer a question using RAG over indexed simulation data."""
        memory = self._get_or_create_memory(session_id)

        prompt = PromptTemplate(
            input_variables=["context", "chat_history", "question"],
            template=CFD_SYSTEM_PROMPT
        )

        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": settings.TOP_K_RESULTS}
            ),
            memory=memory,
            combine_docs_chain_kwargs={"prompt": prompt},
            return_source_documents=True,
            verbose=False
        )

        result = chain.invoke({"question": question})

        sources = list({
            doc.metadata.get("source", "unknown")
            for doc in result.get("source_documents", [])
        })

        return {
            "answer": result["answer"],
            "sources": sources,
            "session_id": session_id
        }

    def clear_session(self, session_id: str):
        """Clear conversation history for a session."""
        if session_id in self._sessions:
            del self._sessions[session_id]



rag_service = RAGService()
