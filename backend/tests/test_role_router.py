"""
Tests role based intent routing.

Usage:
python -m tests.test_role_router
"""

import os
import sys

from app.agents.role_router import (
    get_allowed_intents,
    role_router_node,
)


def test_role_router():

    print("\n=== Role Router Tests ===")


    # Analyst permissions

    analyst = get_allowed_intents("analyst")

    print("\nAnalyst intents:")
    print(analyst)

    assert "generate_memo" in analyst
    assert "compare_companies" in analyst
    assert "approve_reject" not in analyst


    # Manager permissions

    manager = get_allowed_intents("manager")

    print("\nManager intents:")
    print(manager)

    assert "review_pending_memo" in manager
    assert "approve_reject" in manager
    assert "generate_memo" not in manager


    # Invalid role

    print("\nTesting invalid role...")

    try:
        get_allowed_intents("unknown")

        assert False, "Invalid role should raise ValueError"

    except ValueError as e:
        print(f"Expected error: {e}")


    # Trace update

    state = {
        "role": "analyst",
        "trace_steps": []
    }

    output = role_router_node(state)

    print("\nTrace:")
    print(output["trace_steps"])

    assert "Routing as analyst" in output["trace_steps"]


    print("\n✅ Role router passed")


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
        "tests/test_role_router.txt",
        "w",
        encoding="utf-8"
    ) as f:

        old = sys.stdout
        sys.stdout = Tee(old, f)

        try:
            test_role_router()

        finally:
            sys.stdout = old

    print("✅ Output saved: tests/test_role_router.txt")