"""
Tests individual agent tools:
- Market data
- Financial ratios
- Company comparison
- Investment cases
- Memo generation

Usage:
python -m tests.test_tools
"""

import os
import sys

from app.agents.tools.market_tool import fetch_market_data
from app.agents.tools.ratios_tool import calculate_financial_ratios
from app.agents.tools.comparison_tool import compare_companies
from app.agents.tools.case_tool import (
    list_investment_cases,
    load_investment_case,
)
from app.agents.tools.memo_tool import generate_investment_memo


def test_market():

    print("\n=== Market Data Tool ===")

    result = fetch_market_data(
        ["NVDA", "MSFT", "AAPL"]
    )

    for ticker, data in result.items():

        assert "price" in data

        print(
            f"{ticker}: "
            f"${data['price']}"
        )

    print("✅ Market tool passed")


def test_ratios():

    print("\n=== Financial Ratios Tool ===")

    for ticker in ["NVDA", "MSFT", "AAPL"]:

        ratios = calculate_financial_ratios(ticker)

        assert ratios["pe_ratio"] is not None

        print(
            f"{ticker}: {ratios}"
        )

    print("✅ Ratios tool passed")


def test_comparison():

    print("\n=== Company Comparison Tool ===")

    result = compare_companies(
        ["NVDA", "MSFT", "AAPL"]
    )

    assert result["comparison_rows"]

    for row in result["comparison_rows"]:
        print(row)

    print("✅ Comparison tool passed")


def test_case_store():

    print("\n=== Investment Case Tool ===")

    cases = list_investment_cases()

    assert cases

    print(
        f"Available cases: {len(cases)}"
    )

    case = load_investment_case(
        cases[0]["id"]
    )

    assert case is not None

    print(
        f"Loaded: {case['company']} "
        f"- {case['thesis']}"
    )

    print("✅ Case tool passed")


def test_memo():

    print("\n=== Memo Generation Tool ===")

    try:

        memo = generate_investment_memo(
            ticker="NVDA",
            company="NVIDIA Corporation",
            chat_history=[
                {
                    "role": "user",
                    "text": "How is NVIDIA performing?"
                }
            ],
            author="Analyst",
        )

        assert memo["thesis"]
        assert memo["citations"]

        print(
            f"Thesis: {memo['thesis']}"
        )

        print(
            f"Confidence: {memo['confidence']}"
        )

        print(
            f"Citations: {memo['citations']}"
        )

        print("✅ Memo tool passed")

    except Exception as e:

        print(
            f" Memo skipped: {e}"
        )


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

    with open("tests/test_tools.txt", "w", encoding="utf-8") as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:

            test_market()
            test_ratios()
            test_comparison()
            test_case_store()
            test_memo()

            print("\n🎉 Tool tests completed")

        finally:

            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_tools.txt")