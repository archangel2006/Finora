"""
Tests the analyst -> manager review package.

Usage:
python -m tests.test_review_package
"""

import os
import sys

from app.agents.memo.review_package import (
    create_review_package,
    update_review_decision,
)


def test_review_package():

    print("\n=== Review Package Tests ===")

    memo = {
        "ticker": "NVDA",
        "company": "NVIDIA Corporation",
        "thesis": "Long-Term Buy",
        "confidence": 82,
        "summary": (
            "NVIDIA remains the dominant supplier of AI "
            "training and inference infrastructure."
        ),
        "citations": [
            "NVDA 10-K Annual Report, Item 1. Business Overview",
            "NVDA 10-K Annual Report, Item 1A. Risk Factors",
            "Calculated Ratios",
        ],
    }

    print("\nCreating review package...")

    package = create_review_package(
        memo,
        author="Priya Shah",
        session_id="session-123",
    )

    print("Package created:")
    print(package)

    assert package["memo"]["ticker"] == "NVDA"
    assert package["memo"]["company"] == "NVIDIA Corporation"
    assert package["memo"]["thesis"] == "Long-Term Buy"
    assert package["memo"]["confidence"] == 82

    assert package["analyst"]["author"] == "Priya Shah"

    assert package["review"]["status"] == "pending"
    assert package["review"]["manager"] is None
    assert package["review"]["decision"] is None

    # Privacy checks.
    assert "message" not in package
    assert "question" not in package
    assert "chat_history" not in package
    assert "session_history" not in package
    assert "trace_steps" not in package

    print("✓ Memo included")
    print("✓ Analyst included")
    print("✓ Review status initialized")
    print("✓ Raw chat excluded")
    print("✓ Original question excluded")
    print("✓ Agent trace excluded")

    print("\nTesting manager approval...")

    approved = update_review_decision(
        package,
        manager="David Ortega",
        decision="approved",
    )

    assert approved["review"]["status"] == "approved"
    assert approved["review"]["manager"] == "David Ortega"
    assert approved["review"]["decision"] == "approved"

    print("✓ Approval recorded")

    print("\nTesting revision request...")

    revision = update_review_decision(
        package,
        manager="David Ortega",
        decision="revision_requested",
        comments="Add more evidence around China export restrictions.",
    )

    assert revision["review"]["status"] == "revision_requested"
    assert revision["review"]["manager"] == "David Ortega"
    assert (
        revision["review"]["comments"]
        == "Add more evidence around China export restrictions."
    )

    print("✓ Revision request recorded")

    print("\nTesting rejection...")

    rejected = update_review_decision(
        package,
        manager="David Ortega",
        decision="rejected",
        comments="Risk/reward is not attractive enough.",
    )

    assert rejected["review"]["status"] == "rejected"
    assert rejected["review"]["decision"] == "rejected"

    print("✓ Rejection recorded")

    print("\nTesting invalid decision...")

    try:
        update_review_decision(
            package,
            manager="David Ortega",
            decision="maybe",
        )
        assert False, "Invalid decision should raise ValueError"
    except ValueError as exc:
        print(f"✓ Expected error: {exc}")

    print("\n🎉 Review package tests passed")


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
        "tests/test_review_package.txt",
        "w",
        encoding="utf-8",
    ) as f:

        original_stdout = sys.stdout
        sys.stdout = Tee(original_stdout, f)

        try:
            test_review_package()

        finally:
            sys.stdout = original_stdout

    print("✅ Output saved: tests/test_review_package.txt")