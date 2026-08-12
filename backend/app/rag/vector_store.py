from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.config import settings

_store = None

# rag: lazily load (or build) the FAISS index for filings / transcripts ------
def get_vector_store():
    global _store
    if _store is None:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        _store = FAISS.load_local(settings.vector_store_path, embeddings, allow_dangerous_deserialization=True)
    return _store