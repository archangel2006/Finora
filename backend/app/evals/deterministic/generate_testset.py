"""
Generates the synthetic evaluation test set using Claude.

The raw test set contains only realistic user queries and their
scenario category. IDs and evaluation dimensions are added later
when the golden dataset is curated.
"""

import json
import os
from collections import Counter

from app.agents.llm_client import _client, MODEL


SUPPORTED_COMPANIES = """
Company data is currently available only for:
- NVIDIA
- Apple
- Microsoft

Other companies may be mentioned in test queries to test unsupported-
company handling.
"""


PROMPT = f"""
Generate exactly 50 realistic user queries for an Investment Research Copilot.

{SUPPORTED_COMPANIES}

The agent can research companies, retrieve financial metrics,
compare companies, analyze performance, and create investment memos.

Distribution:
- 20 happy_path
- 15 ambiguous
- 10 edge_case
- 5 adversarial

Cover:
- individual company research
- financial metrics and ratios
- revenue, earnings, margins, cash flow
- stock/market performance
- company comparisons
- investment memo requests
- unsupported companies
- unclear or incomplete company references
- realistic follow-up-style questions

Make queries sound like normal users. Do not mention internal tools,
planners, executors, APIs, schemas, Python, or implementation details.

Return ONLY valid JSON as a list of objects in this format:

[
  {{
    "query": "What was NVIDIA's revenue last year?",
    "category": "happy_path"
  }}
]

Allowed categories:
happy_path
ambiguous
edge_case
adversarial
"""


def generate_testset() -> list[dict]:
    """Call Claude and validate the generated raw test set."""

    response = _client.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[
            {
                "role": "user",
                "content": PROMPT,
            }
        ],
    )

    text = "".join(
        block.text
        for block in response.content
        if hasattr(block, "text")
    ).strip()

    if text.startswith("```"):
        text = text.split("```", 2)[1].strip()

        if text.startswith("json"):
            text = text[4:].strip()

    queries = json.loads(text)

    if not isinstance(queries, list):
        raise ValueError("Claude response was not a JSON list.")

    if len(queries) != 50:
        raise ValueError(
            f"Expected 50 queries, but Claude generated {len(queries)}."
        )

    required_fields = {"query", "category"}

    valid_categories = {
        "happy_path",
        "ambiguous",
        "edge_case",
        "adversarial",
    }

    for query in queries:
        if not required_fields.issubset(query):
            raise ValueError(
                f"Invalid query entry: {query}"
            )

        if query["category"] not in valid_categories:
            raise ValueError(
                f"Invalid category: {query['category']}"
            )

        if not isinstance(query["query"], str) or not query["query"].strip():
            raise ValueError(
                f"Empty query: {query}"
            )

    return queries


def save_testset(queries: list[dict]) -> None:
    """Save the validated synthetic test set."""

    output_path = os.path.join(
        os.path.dirname(__file__),
        "testset_raw.json",
    )

    distribution = Counter(
        query["category"]
        for query in queries
    )

    print(f"Generated {len(queries)} queries.")
    print("Distribution:")

    for category in (
        "happy_path",
        "ambiguous",
        "edge_case",
        "adversarial",
    ):
        print(
            f"  {category}: {distribution.get(category, 0)}"
        )

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(
            queries,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print("\nSaved test set to:")
    print(output_path)


if __name__ == "__main__":
    testset = generate_testset()
    save_testset(testset)