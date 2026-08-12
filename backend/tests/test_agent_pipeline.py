"""
Tests the current agent pipeline without LangGraph.

Uses the existing:

- Role Router
- Intent Classifier
- Entity Extractor
- Ticker Resolver
- Tool Planner
- Tool Executor
- Existing tools

Usage:
python -m tests.test_agent_pipeline
"""

import os
import sys

from app.agents.state import AgentState
from app.agents.role_router import role_router_node
from app.agents.intent_classifier import classify_intent
from app.agents.entity_extractor import extract_entities_node
from app.agents.planner import build_tool_plan
from app.agents.executor import execute_tool_plan


CASES = [
    ("analyst", "Analyze NVIDIA business performance"),
    ("analyst", "What is NVIDIA's P/E ratio?"),
    ("analyst", "Compare NVIDIA and Apple as investment opportunities"),
    ("analyst", "Analyze NVIDIA and give me its P/E ratio"),
    ("analyst", "Compare NVIDIA and Apple and show their revenue growth"),
    (
        "analyst",
        "Analyze NVIDIA, compare it with Apple, and create an investment memo",
    ),
    (
        "analyst",
        "Analyze NVIDIA, show its P/E ratio, and create an investment memo",
    ),
    ("analyst", "Create an investment memo for NVIDIA"),
    ("analyst", "Tell me about NVIDIA and tell me a joke"),
    (
        "analyst",
        "Compare NVIDIA and Apple, then help me plan my vacation",
    ),
    ("analyst", "Tell me a joke"),
    ("manager", "Review the pending NVIDIA investment memo"),
    (
        "manager",
        "Review the NVIDIA memo and tell me whether it should be approved",
    ),
    (
        "manager",
        "Review the Apple memo and answer my follow-up questions",
    ),
    ("manager", "Approve the NVIDIA investment recommendation"),
    ("manager", "Explain quantum physics"),
]


def test_agent_pipeline():
    print("\n=== Agent Pipeline Tests ===")

    passed = 0
    failed = 0

    for i, (role, message) in enumerate(CASES, 1):

        print("\n----------------------------")
        print(f"TEST {i}")
        print(f"ROLE: {role}")
        print(f"QUERY: {message}")

        state: AgentState = {
            "role": role,
            "message": message,
            "session_history": [],
            "case_id": None,
            "author": "Test User",
            "intent": None,
            "intents": [],
            "company_entities": [],
            "tickers": [],
            "unavailable_companies": [],
            "memory_hit": False,
            "memory_answer": None,
            "tool_plan": [],
            "tool_results": {},
            "final_output": None,
            "trace_steps": [],
        }

        try:
            state = role_router_node(state)
            state = classify_intent(state)

            # Use the existing state-aware entity extractor.
            state = extract_entities_node(state)

            state = build_tool_plan(state)
            state = execute_tool_plan(state)

            print(f"INTENTS: {state.get('intents')}")
            print(f"ENTITIES: {state.get('company_entities')}")
            print(f"TICKERS: {state.get('tickers')}")
            print(f"UNAVAILABLE: {state.get('unavailable_companies')}")
            print(f"PLAN: {state.get('tool_plan')}")
            print(f"RESULTS: {state.get('tool_results')}")
            print(f"TRACE: {state.get('trace_steps')}")

            assert state.get("intents"), "No intents classified"
            assert state.get("tickers") is not None, "Ticker extraction missing"
            assert state.get("tool_plan") is not None, "No tool plan produced"
            assert state.get("tool_results") is not None, "No tool results produced"
            assert state.get("trace_steps"), "Trace is empty"

            for step in state["tool_results"].values():
                assert "result" in step, f"Missing execution result: {step}"

                result = step["result"]

                assert not (
                    isinstance(result, dict) and "error" in result
                ), f"Tool failed: {result}"

            print("PASSED")
            passed += 1

        except Exception as exc:
            print(f"FAILED: {type(exc).__name__}: {exc}")
            failed += 1

    print("\n=== Pipeline Test Summary ===")
    print(f"Total: {len(CASES)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")

    assert failed == 0, f"{failed} pipeline test(s) failed"

    print("\nAgent pipeline tests completed")


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
        "tests/test_agent_pipeline.txt",
        "w",
        encoding="utf-8",
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_agent_pipeline()
        finally:
            sys.stdout = original_stdout

    print("Output saved: tests/test_agent_pipeline.txt")