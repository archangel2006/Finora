"""
Tests entity extraction and ticker resolution.

Uses real Claude structured output.

Usage:
python -m tests.test_entity
"""

import os
import sys

from app.agents.entity_extractor import extract_entities

def test_entity_cases():

    print("\n=== Entity Extractor Tests ===")

    cases = [
        ("Analyze NVIDIA business performance", ["NVDA"], []),
        ("Compare NVIDIA and AMD as investment opportunities", ["NVDA"], ["AMD"]),
        ("Compare Apple against Microsoft", ["AAPL", "MSFT"], []),
        ("What are Microsoft's AI risks?", ["MSFT"], []),
        ("Give me Apple's financial metrics", ["AAPL"], []),
        ("Analyze nvda and aapl", ["NVDA", "AAPL"], []),

        # aliases
        ("How is Nvidia Corporation performing?", ["NVDA"], []),
        ("Tell me about Microsoft Corp growth", ["MSFT"], []),
        ("Apple Inc revenue trends", ["AAPL"], []),

        # spelling mistakes / fuzzy resolver
        ("Analyze Nvida business outlook", ["NVDA"], []),
        ("Compare Microsof and Apple", ["MSFT", "AAPL"], []),
        ("What are Appl's biggest risks?", ["AAPL"], []),
    ]

    for message, expected_tickers, expected_unavailable in cases:

        print("\n----------------------------")
        print(f"QUERY: {message}")

        predicted, unavailable = extract_entities(message)

        print(f"EXPECTED TICKERS: {expected_tickers}")
        print(f"PREDICTED TICKERS: {predicted}")
        print(f"UNAVAILABLE: {unavailable}")

        assert predicted == expected_tickers, (
            f"Expected tickers {expected_tickers}, got {predicted}"
        )

        assert unavailable == expected_unavailable, (
            f"Expected unavailable {expected_unavailable}, got {unavailable}"
        )

        print("✅ Passed")

    print("\n🎉 Entity extractor tests completed")

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

    with open(
        "tests/test_entity.txt",
        "w",
        encoding="utf-8"
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_entity_cases()

        finally:
            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_entity.txt")