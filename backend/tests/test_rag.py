"""
Tests RAG retrieval using FAISS index.
Run after ingest.py.

Usage:
python -m tests.test_rag
"""

import os
import sys

from app.agents.tools.rag_tool import search_docs


def test_rag_queries():
    print("\n=== RAG Retrieval Tests ===")

    queries = [
        ("What did NVIDIA say about China export restrictions?", "NVDA"),
        ("What was NVIDIA revenue growth last year?", "NVDA"),
        ("How is Azure AI revenue growing?", "MSFT"),
        ("What are Microsoft's main risks?", "MSFT"),
        ("What are Apple's main risk factors?", "AAPL"),
        ("Compare gross margin trends across companies", None),
    ]

    for query, company in queries:
        print("\n----------------------------")
        print(f"QUERY: {query}")
        print(f"COMPANY FILTER: {company}")

        results = search_docs(
            query,
            company=company,
            k=3,
        )

        assert results, f"No results returned for: {query}"

        print(f"RESULT COUNT: {len(results)}")

        for r in results:
            print(
                f"[{r['citation']}] "
                f"score={r['score']:.3f} :: "
                f"{r['text'][:120]}..."
            )

        print("✅ Query passed")

    print("\n🎉 RAG tests completed")


class Tee:
    def __init__(self, *files):
        self.files = files

    def write(self, data):
        for f in self.files:
            f.write(data)
            f.flush()

    def flush(self):
        for f in self.files:
            f.flush()


if __name__ == "__main__":

    os.makedirs("tests", exist_ok=True)

    with open("tests/test_rag.txt", "w", encoding="utf-8") as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_rag_queries()

        finally:
            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_rag.txt")