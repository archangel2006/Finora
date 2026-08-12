"""
Tests multi-intent classification.

Usage:
    python -m tests.test_multi_intent
"""

import os
import sys

from app.agents.intent_classifier import classify_intent
from app.agents.state import AgentState


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


def run_case(role: str, message: str, expected: list[str]):
    state: AgentState = {
        "role": role,
        "message": message,
        "session_history": [],
        "case_id": None,
        "author": "Test User",
        "intent": None,
        "intents": [],
        "tickers": [],
        "unavailable_companies": [],
        "memory_hit": False,
        "memory_answer": None,
        "tool_results": {},
        "final_output": None,
        "trace_steps": [],
    }

    result = classify_intent(state)
    predicted = result["intents"]

    print("\n----------------------------")
    print(f"ROLE: {role}")
    print(f"QUERY: {message}")
    print(f"EXPECTED: {expected}")
    print(f"PREDICTED: {predicted}")
    print(f"TRACE: {result['trace_steps']}")

    assert predicted == expected, (
        f"Expected {expected}, got {predicted}"
    )

    print("PASSED")


def test_multi_intent_cases():

    print("\n=== Multi-Intent Classifier Tests ===")

    cases = [

        # --------------------------------------------------
        # Two related research tasks
        # --------------------------------------------------

        (
            "analyst",
            "Analyze NVIDIA and give me its P/E ratio",
            ["analyze_company", "metric_lookup"],
        ),

        (
            "analyst",
            "Compare NVIDIA and Apple and show their revenue growth",
            ["compare_companies", "metric_lookup"],
        ),

        (
            "analyst",
            "Analyze NVIDIA's risks and financial metrics",
            ["analyze_company", "metric_lookup"],
        ),

        # --------------------------------------------------
        # Multiple companies + multiple tasks
        # --------------------------------------------------

        (
            "analyst",
            "Compare NVIDIA and Apple and analyze their growth strategies",
            ["compare_companies", "analyze_company"],
        ),

        (
            "analyst",
            "Compare NVIDIA and Microsoft, then create an investment memo",
            ["compare_companies", "generate_memo"],
        ),

        # --------------------------------------------------
        # Three intents
        # --------------------------------------------------

        (
            "analyst",
            "Analyze NVIDIA, compare it with Apple, and create an investment memo",
            [
                "analyze_company",
                "compare_companies",
                "generate_memo",
            ],
        ),

        (
            "analyst",
            "Analyze NVIDIA, show its P/E ratio, and create an investment memo",
            [
                "analyze_company",
                "metric_lookup",
                "generate_memo",
            ],
        ),

        # --------------------------------------------------
        # Single intent should remain single
        # --------------------------------------------------

        (
            "analyst",
            "Analyze NVIDIA business performance",
            ["analyze_company"],
        ),

        (
            "analyst",
            "What is Microsoft's P/E ratio?",
            ["metric_lookup"],
        ),

        (
            "analyst",
            "Create an investment memo for NVIDIA",
            ["generate_memo"],
        ),

        # --------------------------------------------------
        # Mixed valid + out-of-scope request
        # --------------------------------------------------

        (
            "analyst",
            "Tell me about NVIDIA and tell me a joke",
            ["analyze_company", "out_of_scope"],
        ),

        (
            "analyst",
            "Compare NVIDIA and Apple, then help me plan my vacation",
            ["compare_companies", "out_of_scope"],
        ),

        # --------------------------------------------------
        # Manager multi-intent
        # --------------------------------------------------

        (
            "manager",
            "Review the NVIDIA memo and tell me whether it should be approved",
            ["review_pending_memo", "approve_reject"],
        ),

        (
            "manager",
            "Review the Apple memo and answer my follow-up questions",
            ["review_pending_memo", "ask_followup"],
        ),

        # --------------------------------------------------
        # Manager out-of-scope
        # --------------------------------------------------

        (
            "manager",
            "Review the NVIDIA memo and explain quantum physics",
            ["review_pending_memo", "out_of_scope"],
        ),
    ]

    for role, message, expected in cases:
        run_case(role, message, expected)

    print("\n🎉 Multi-intent classifier tests completed")


if __name__ == "__main__":

    os.makedirs("tests", exist_ok=True)

    with open(
        "tests/test_multi_intent.txt",
        "w",
        encoding="utf-8",
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_multi_intent_cases()

        finally:
            sys.stdout = original_stdout

    print("Output saved: tests/test_multi_intent.txt")