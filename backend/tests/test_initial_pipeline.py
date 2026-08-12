"""
Run after ingest.py to verify the full RAG + mocked-live-data + memo pipeline.
Usage: python test1.py
"""
from app.agents.tools.rag_tool import search_docs
from app.agents.tools.market_tool import fetch_market_data
from app.agents.tools.ratios_tool import calculate_financial_ratios
from app.agents.tools.comparison_tool import compare_companies
from app.agents.tools.case_tool import list_investment_cases, load_investment_case
from app.agents.tools.memo_tool import generate_investment_memo


def test_rag():
    print("\n=== RAG (search_docs) ===")
    results = search_docs("What did NVIDIA say about China export restrictions?", company="NVDA", k=2)
    assert results, "No RAG results returned"
    for r in results:
        print(f"  [{r['citation']}] score={r['score']:.3f} :: {r['text'][:100]}...")
    print("✅ RAG passed")


def test_rag_more_cases():
    print("\n=== RAG additional cases ===")

    cases = [
        ("What was NVIDIA's revenue last year?", "NVDA"),
        ("How is Azure AI revenue growing?", "MSFT"),
        ("What are Apple's main risk factors?", "AAPL"),
        ("Compare gross margin trends across companies", None),
    ]

    for query, company in cases:
        results = search_docs(
            query,
            company=company,
            k=3
        )

        assert results, f"No results for: {query}"

        print(f"Q: {query} [{company}] -> {len(results)} results")

    print("✅ Additional RAG cases passed")


def test_market_and_ratios():
    print("\n=== Market data + ratios (mocked) ===")
    market = fetch_market_data(["NVDA", "MSFT", "AAPL"])

    for t, d in market.items():
        assert "price" in d, f"Missing price for {t}"
        print(f"  {t}: ${d['price']}")
    ratios = calculate_financial_ratios("NVDA")
    assert ratios["pe_ratio"] is not None
    print(f"  NVDA ratios: {ratios}")
    print("✅ Market + ratios passed")


def test_comparison():
    print("\n=== compare_companies ===")
    result = compare_companies(["NVDA", "MSFT", "AAPL"])
    assert result["comparison_rows"], "No comparison rows produced"
    for row in result["comparison_rows"]:
        print(f"  {row}")
    print("✅ Comparison passed")


def test_case_store():
    print("\n=== Case store ===")
    cases = list_investment_cases()
    assert cases, "No seed cases found"
    first = load_investment_case(cases[0]["id"])
    assert first is not None
    print(f"  Loaded: {first['company']} — {first['thesis']}")
    print("✅ Case store passed")


def test_memo_generation():
    print("\n=== Memo generation (requires ANTHROPIC_API_KEY) ===")
    try:
        memo = generate_investment_memo(
            ticker="NVDA", company="NVIDIA Corporation",
            chat_history=[{"role": "user", "text": "How is NVIDIA doing and will it grow?"}],
            author="Priya Shah",
        )
        assert memo["thesis"], "Memo missing thesis"
        assert memo["citations"], "Memo missing citations"
        print(f"  Thesis: {memo['thesis']} (confidence {memo['confidence']})")
        print(f"  Summary: {memo['summary']}...")
        print(f"  Citations: {memo['citations']}")
        print("✅ Memo generation passed")
    except Exception as e:
        print(f"Memo generation skipped/failed: {e}")
        print("    (Check ANTHROPIC_API_KEY in .env if this is unexpected)")

if __name__ == "__main__":

    import os
    import sys

    os.makedirs("tests", exist_ok=True)

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

    with open("tests/test1.txt", "w", encoding="utf-8") as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_rag()
            test_rag_more_cases()
            test_market_and_ratios()
            test_comparison()
            test_case_store()
            test_memo_generation()

            print("\n🎉 Pipeline check complete.")

        finally:
            sys.stdout = original_stdout

    print("✅ Test output saved to tests/test1.txt")