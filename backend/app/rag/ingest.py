"""
Rebuilds the FULL FAISS index from every PDF under documents/companies/.
Rerun this any time a document is added/changed/removed — fully idempotent,
single source of truth for the vector DB. Never call FAISS commands manually.

Usage: python -m app.rag.ingest
"""
import pdfplumber
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from app.config import settings
from app.rag.chunker import chunk_by_heading

DOC_TYPE_MAP = {"10k": "10-K Annual Report", "10q": "10-Q Quarterly Report", "earnings_call": "Earnings Call Transcript"}


def extract_text(pdf_path: Path) -> str:
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def infer_doc_type(filename: str) -> str:
    name = filename.lower()
    for key, label in DOC_TYPE_MAP.items():
        if key in name:
            return label
    return "Unknown"


def ingest_all():
    companies_root = Path(settings.documents_path)
    all_docs = []

    for company_dir in sorted(companies_root.iterdir()):
        if not company_dir.is_dir():
            continue
        ticker = company_dir.name
        for pdf_path in sorted(company_dir.glob("*.pdf")):
            text = extract_text(pdf_path)
            base_metadata = {
                "company": ticker,
                "doc_type": infer_doc_type(pdf_path.stem),
                "source_file": pdf_path.name,
            }
            chunks = chunk_by_heading(text, base_metadata)
            all_docs.extend(chunks)
            print(f"  {ticker}/{pdf_path.name}: {len(chunks)} chunks")

    if not all_docs:
        raise RuntimeError(f"No PDFs found under {companies_root}")

    print(f"\nTotal chunks: {len(all_docs)}")
    print("Embedding + building index (single build, not per-file)...")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    store = FAISS.from_documents(all_docs, embeddings)  # ← built ONCE from ALL docs
    store.save_local(settings.vector_store_path)

    print(f"✅ Index saved to {settings.vector_store_path}")


if __name__ == "__main__":
    ingest_all()