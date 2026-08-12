"""
Tool: search_docs()
Source: RAG (FAISS vector DB built by rag/ingest.py from the 9 synthetic PDFs)
"""
from app.rag.retriever import retrieve, format_citation


def search_docs(query: str, company: str | None = None, doc_type: str | None = None, k: int = 4) -> list[dict]:
    results = retrieve(query, company=company, doc_type=doc_type, top_k=k)
    return [
        {"text": r["text"], "citation": format_citation(r["metadata"]), "metadata": r["metadata"], "score": r["score"]}
        for r in results
    ]