"""
Tests deterministic tool planning.

Usage:
python -m tests.test_tool_planner
"""

import os
import sys

from app.agents.tool_planner import plan_tools


def make_state(intent, tickers=None):
    return {
        "role": "analyst",
        "message": "test message",
        "session_history": [],
        "case_id": None,
        "author": None,

        "intent": intent,
        "tickers": tickers or [],

        "memory_hit": False,
        "memory_answer": None,

        "tool_results": {},

        "final_output": None,
        "trace_steps": [],
    }


def test_tool_plans():

    print("\n=== Tool Planner Tests ===")

    cases = [
        ("analyze_company", ["NVDA"], ["rag", "market_data", "financial_ratios"]),
        ("metric_lookup", ["NVDA"], ["market_data", "financial_ratios"]),
        ("compare_companies", ["NVDA", "MSFT"], ["comparison", "rag"]),
        ("generate_memo", ["NVDA"], ["rag", "market_data", "financial_ratios", "case"]),
        ("review_pending_memo", [], ["case"]),
        ("approve_reject", [], ["case"]),
        ("ask_followup", ["NVDA"], ["rag", "market_data", "financial_ratios"]),
        ("ask_followup", [], ["rag"]),
        ("out_of_scope", [], []),
    ]

    for intent, tickers, expected in cases:

        print("\n----------------------------")
        print(f"INTENT: {intent}")
        print(f"TICKERS: {tickers}")

        state = make_state(intent, tickers)

        result = plan_tools(state)

        predicted = result["tool_results"]["plan"]

        print(f"EXPECTED PLAN: {expected}")
        print(f"PREDICTED PLAN: {predicted}")
        print(f"TRACE: {result['trace_steps']}")

        assert predicted == expected, (
            f"Expected {expected}, got {predicted}"
        )

        print("✅ Passed")

    print("\n🎉 Tool planner tests completed")


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
        "tests/test_tool_planner.txt",
        "w",
        encoding="utf-8"
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_tool_plans()

        finally:
            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_tool_planner.txt")