import logging
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from app.config import settings


logger = logging.getLogger(__name__)

_store = None


def _get_store():
    global _store

    if _store is None:
        index_path = Path(settings.vector_store_path)
        if not index_path.exists():
            logger.warning("FAISS vector store directory not found at %s", index_path)
            return None

        logger.debug(
            "Loading FAISS index from: %s",
            settings.vector_store_path,
        )

        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        try:
            _store = FAISS.load_local(
                settings.vector_store_path,
                embeddings,
                allow_dangerous_deserialization=True,
            )
            logger.debug("FAISS index loaded successfully")
        except Exception as e:
            logger.error("Failed to load FAISS index: %s", e)
            return None

    return _store


def retrieve(
    query: str,
    company: str | None = None,
    doc_type: str | None = None,
    top_k: int = 4,
) -> list[dict]:
    store = _get_store()
    if not store:
        logger.warning("No vector store loaded. Returning empty retrieval results.")
        return []

    fetch_k = top_k * 10 if (company or doc_type) else top_k
    fetch_k = min(fetch_k, 100)

    logger.debug(
        "FAISS retrieval: query=%r fetch_k=%d company=%r doc_type=%r",
        query,
        fetch_k,
        company,
        doc_type,
    )

    results = store.similarity_search_with_score(
        query,
        k=fetch_k,
    )

    logger.debug(
        "FAISS returned %d documents",
        len(results),
    )

    filtered = []

    for doc, score in results:
        meta = doc.metadata

        logger.debug(
            "Candidate: company=%s doc_type=%s score=%.4f",
            meta.get("company"),
            meta.get("doc_type"),
            score,
        )

        if company and meta.get("company", "").upper() != company.upper():
            logger.debug("Candidate removed by company filter")
            continue

        if (
            doc_type
            and doc_type.lower()
            not in meta.get("doc_type", "").lower()
        ):
            logger.debug("Candidate removed by doc_type filter")
            continue

        filtered.append(
            {
                "text": doc.page_content,
                "metadata": meta,
                "score": float(score),
            }
        )

        if len(filtered) >= top_k:
            break

    if not filtered:
        logger.warning(
            "FAISS retrieval returned no matching documents "
            "for query=%r company=%r doc_type=%r",
            query,
            company,
            doc_type,
        )

    logger.debug(
        "FAISS retrieval finished with %d documents",
        len(filtered),
    )

    return filtered


def format_citation(metadata: dict) -> str:
    return (
        f"{metadata.get('company')} "
        f"{metadata.get('doc_type')}, "
        f"{metadata.get('section')}"
    )