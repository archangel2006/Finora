"""
Tests LangGraph intent classifier node.

Uses real Claude structured output.

Usage:
python -m tests.test_intent
"""

import os
import sys

from app.agents.intent_classifier import classify_intent


def test_intent_cases():

    print("\n=== Intent Classifier Tests ===")

    cases = [
        # Analyst flows
        ("analyst", "Analyze NVIDIA business performance, growth strategy, and risks", "analyze_company"),
        ("analyst", "Give me a deep dive into Microsoft's AI strategy", "analyze_company"),
        ("analyst", "Compare NVIDIA versus AMD as investment opportunities", "compare_companies"),
        ("analyst", "Should I invest in NVIDIA or Apple?", "compare_companies"),
        ("analyst", "What is NVIDIA's P/E ratio and revenue growth?", "metric_lookup"),
        ("analyst", "Find Apple's latest financial metrics", "metric_lookup"),
        ("analyst", "Create an investment memo for NVIDIA", "generate_memo"),
        ("analyst", "Draft an investment case for Microsoft", "generate_memo"),

        # Manager flows
        ("manager", "Review the pending NVIDIA investment memo", "review_pending_memo"),
        ("manager", "I want to ask questions about the submitted Apple analysis", "ask_followup"),
        ("manager", "Approve the NVIDIA investment recommendation", "approve_reject"),

        # Out of scope
        ("analyst", "Tell me a joke", "out_of_scope"),
        ("analyst", "Help me write a vacation plan", "out_of_scope"),
        ("manager", "Explain quantum physics", "out_of_scope"),
    ]

    for role, message, expected in cases:

        print("\n----------------------------")
        print(f"ROLE: {role}")
        print(f"QUERY: {message}")

        state = {
            "role": role,
            "message": message,
            "session_history": [],
            "case_id": None,
            "author": None,

            "intent": None,
            "tickers": [],

            "memory_hit": False,
            "memory_answer": None,

            "tool_results": {},

            "final_output": None,
            "trace_steps": [],
        }

        result = classify_intent(state)

        predicted = result["intent"]

        print(f"EXPECTED: {expected}")
        print(f"PREDICTED: {predicted}")
        print(f"TRACE: {result['trace_steps']}")

        assert predicted == expected, (
            f"Expected {expected}, got {predicted}"
        )

        print("✅ Passed")

    print("\n🎉 Intent classifier tests completed")


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
        "tests/test_intent.txt",
        "w",
        encoding="utf-8"
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_intent_cases()

        finally:
            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_intent.txt")