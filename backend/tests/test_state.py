"""
Tests AgentState structure.

Usage:
python -m tests.test_state
"""

import os
import sys

from app.agents.state import AgentState


def test_state_creation():

    print("\n=== AgentState Test ===")

    state: AgentState = {
        "role": "analyst",
        "message": "Analyze NVIDIA",
        "session_history": [],
        "case_id": None,
        "author": "Test User",

        "intent": None,
        "tickers": [],

        "memory_hit": False,
        "memory_answer": None,

        "tool_results": {},

        "final_output": None,
        "trace_steps": [],
    }


    print("\nSTATE CREATED:")
    print(state)


    required_fields = [
        "role",
        "message",
        "session_history",
        "case_id",
        "author",
        "intent",
        "tickers",
        "memory_hit",
        "memory_answer",
        "tool_results",
        "final_output",
        "trace_steps",
    ]


    print("\nChecking required fields...")

    for field in required_fields:
        assert field in state, f"Missing state field: {field}"

        print(f"✓ {field}")


    print("\nChecking values...")

    assert state["role"] == "analyst"
    assert state["message"] == "Analyze NVIDIA"

    assert isinstance(state["session_history"], list)
    assert isinstance(state["tickers"], list)
    assert isinstance(state["tool_results"], dict)
    assert isinstance(state["trace_steps"], list)

    assert state["intent"] is None
    assert state["memory_hit"] is False


    print("\n✅ AgentState passed")


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
        "tests/test_state.txt",
        "w",
        encoding="utf-8"
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_state_creation()

        finally:
            sys.stdout = original_stdout


    print("✅ Output saved: tests/test_state.txt")